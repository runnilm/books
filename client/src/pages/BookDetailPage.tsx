import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { API } from "@/lib/endpoints";
import type { Book, RatingsSummary, Review } from "@/types/api";
import { useMe } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RatingsSummaryCard } from "@/components/books/RatingsSummary";
import { StarRating } from "@/components/books/StarRating";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    if (typeof err === "object" && err && "message" in err) {
        return String((err as { message: unknown }).message);
    }
    return "Something went wrong. Please try again.";
}

type CollectionBooksResponse = { books: Book[] };

export function BookDetailPage() {
    const { id } = useParams();
    const bookId = id ?? "";
    const nav = useNavigate();
    const qc = useQueryClient();
    const me = useMe();

    const collectionId = me.data?.user?.collectionId ?? null;

    const invalidateCatalog = async () => {
        await qc.invalidateQueries({
            predicate: (q) =>
                Array.isArray(q.queryKey) && q.queryKey[0] === "books",
        });
    };

    const bookQ = useQuery({
        queryKey: qk.book(bookId),
        queryFn: () => apiFetch<{ book: Book }>(API.books.detail(bookId)),
        enabled: !!bookId,
    });

    const reviewsQ = useQuery({
        queryKey: qk.reviews(bookId),
        queryFn: () =>
            apiFetch<{ reviews: Review[]; ratings: RatingsSummary }>(
                API.reviews.listForBook(bookId),
            ),
        enabled: !!bookId,
    });

    const libraryQ = useQuery({
        queryKey:
            typeof collectionId === "number"
                ? qk.collectionBooks(collectionId)
                : ["noop"],
        queryFn: () =>
            apiFetch<CollectionBooksResponse>(
                `${API.collections.listBooks(collectionId as number)}?limit=200&offset=0`,
            ),
        enabled: typeof collectionId === "number",
    });

    const inLibrary = useMemo(() => {
        if (!bookId) return false;
        const books = libraryQ.data?.books ?? [];
        return books.some((b) => b.id === bookId);
    }, [libraryQ.data?.books, bookId]);

    const addToLibrary = useMutation({
        mutationFn: async () => {
            if (typeof collectionId !== "number")
                throw new Error("No collection available.");
            return apiFetch<{ ok: true }>(
                API.collections.addBook(collectionId),
                {
                    method: "POST",
                    body: JSON.stringify({ bookId }),
                },
            );
        },
        onSuccess: async () => {
            if (typeof collectionId === "number") {
                await qc.invalidateQueries({
                    queryKey: qk.collectionBooks(collectionId),
                });
            }
        },
    });

    const removeFromLibrary = useMutation({
        mutationFn: async () => {
            if (typeof collectionId !== "number")
                throw new Error("No collection available.");
            return apiFetch<void>(
                API.collections.removeBook(collectionId, bookId),
                { method: "DELETE" },
            );
        },
        onSuccess: async () => {
            if (typeof collectionId === "number") {
                await qc.invalidateQueries({
                    queryKey: qk.collectionBooks(collectionId),
                });
            }
        },
    });

    const currentUserId = me.data?.user?.id;

    const myReview = useMemo(() => {
        const rs = reviewsQ.data?.reviews ?? [];
        if (!currentUserId) return null;
        return rs.find((r) => r.user.id === currentUserId) ?? null;
    }, [reviewsQ.data?.reviews, currentUserId]);

    const [rating, setRating] = useState<number>(0);
    const [text, setText] = useState<string>("");

    useEffect(() => {
        if (!myReview) {
            setRating(0);
            setText("");
            return;
        }
        setRating((prev) => (prev ? prev : myReview.rating));
        setText((prev) => (prev ? prev : (myReview.text ?? "")));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myReview?.id]);

    const upsertReview = useMutation({
        mutationFn: async () =>
            apiFetch<{ ok: true }>(API.reviews.upsertForBook(bookId), {
                method: "POST",
                body: JSON.stringify({ rating, text }),
            }),
        onSuccess: async () => {
            toast.success("Review saved");

            // refresh detail + reviews + catalog
            await qc.invalidateQueries({ queryKey: qk.reviews(bookId) });
            await qc.invalidateQueries({ queryKey: qk.book(bookId) });
            await invalidateCatalog();
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const deleteMine = useMutation({
        mutationFn: async () =>
            apiFetch<void>(API.reviews.deleteMineForBook(bookId), {
                method: "DELETE",
            }),
        onSuccess: async () => {
            toast.success("Review deleted");
            setRating(0);
            setText("");

            // refresh detail + reviews + catalog
            await qc.invalidateQueries({ queryKey: qk.reviews(bookId) });
            await qc.invalidateQueries({ queryKey: qk.book(bookId) });
            await invalidateCatalog();
        },
        onError: (err) => toast.error(getErrorMessage(err)),
    });

    const book = bookQ.data?.book ?? null;
    const ratingsSummary = reviewsQ.data?.ratings ?? null;
    const reviews = reviewsQ.data?.reviews ?? [];

    if (!bookId) {
        return (
            <EmptyState
                title="Missing book ID"
                description="Return to the list and try again."
                actionLabel="Back to books"
                onAction={() => nav("/app/books")}
            />
        );
    }

    if (bookQ.isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Loading…</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Fetching book details.
                </CardContent>
            </Card>
        );
    }

    if (bookQ.isError || !book) {
        return (
            <EmptyState
                title="Book not found"
                description="This book may have been removed."
                actionLabel="Back to books"
                onAction={() => nav("/app/books")}
            />
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <CardTitle className="truncate text-base">
                                {book.title}
                            </CardTitle>
                            <div className="text-sm text-muted-foreground">
                                {book.author}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                ISBN: {book.isbn} - {book.category}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link to="/app/library">My Library</Link>
                            </Button>

                            {typeof collectionId === "number" ? (
                                inLibrary ? (
                                    <Button
                                        variant="outline"
                                        disabled={removeFromLibrary.isPending}
                                        onClick={async () => {
                                            try {
                                                await removeFromLibrary.mutateAsync();
                                                toast.success(
                                                    "Removed from your library",
                                                );
                                            } catch (e) {
                                                toast.error(getErrorMessage(e));
                                            }
                                        }}
                                    >
                                        {removeFromLibrary.isPending
                                            ? "Removing…"
                                            : "Remove"}
                                    </Button>
                                ) : (
                                    <Button
                                        disabled={addToLibrary.isPending}
                                        onClick={async () => {
                                            try {
                                                await addToLibrary.mutateAsync();
                                                toast.success(
                                                    "Added to your library",
                                                );
                                            } catch (e) {
                                                toast.error(getErrorMessage(e));
                                            }
                                        }}
                                    >
                                        {addToLibrary.isPending
                                            ? "Adding…"
                                            : "Add to library"}
                                    </Button>
                                )
                            ) : null}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {ratingsSummary ? (
                <RatingsSummaryCard summary={ratingsSummary} />
            ) : null}

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Your review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-col gap-2">
                        <div className="text-sm text-muted-foreground">
                            Rating
                        </div>
                        <StarRating value={rating} onChange={setRating} />
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                            Review
                        </div>
                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="What did you think?"
                            rows={5}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            disabled={upsertReview.isPending}
                            onClick={async () => {
                                try {
                                    await upsertReview.mutateAsync();
                                } catch {
                                    // toast handled in onError
                                }
                            }}
                        >
                            {upsertReview.isPending ? "Saving…" : "Save"}
                        </Button>

                        {myReview ? (
                            <Button
                                variant="destructive"
                                disabled={deleteMine.isPending}
                                onClick={async () => {
                                    try {
                                        await deleteMine.mutateAsync();
                                    } catch {
                                        // toast handled in onError
                                    }
                                }}
                            >
                                {deleteMine.isPending ? "Deleting…" : "Delete"}
                            </Button>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">All reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {reviewsQ.isLoading ? (
                        <div className="text-sm text-muted-foreground">
                            Loading reviews…
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                            No reviews yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reviews.map((r) => (
                                <div key={r.id} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium">
                                            {r.user.username}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {r.rating}/5 ★
                                        </div>
                                    </div>
                                    <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                                        {r.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
