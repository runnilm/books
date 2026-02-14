import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export function BookDetailPage() {
    const { id } = useParams();
    const bookId = id ?? "";
    const nav = useNavigate();
    const qc = useQueryClient();
    const me = useMe();

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

    const save = useMutation({
        mutationFn: (input: { rating: number; text: string }) =>
            apiFetch<{ review: Review }>(API.reviews.upsertForBook(bookId), {
                method: "POST",
                body: JSON.stringify(input),
            }),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: qk.reviews(bookId) });
            await qc.invalidateQueries({ queryKey: qk.book(bookId) });
            toast.success("Review saved");
        },
        onError: (e: unknown) => {
            toast.error(getErrorMessage(e));
        },
    });

    const del = useMutation({
        mutationFn: () =>
            apiFetch<void>(API.reviews.deleteMineForBook(bookId), {
                method: "DELETE",
            }),
        onSuccess: async () => {
            setRating(0);
            setText("");
            await qc.invalidateQueries({ queryKey: qk.reviews(bookId) });
            await qc.invalidateQueries({ queryKey: qk.book(bookId) });
            toast.success("Review deleted");
        },
        onError: (e: unknown) => toast.error(getErrorMessage(e)),
    });

    if (!bookId)
        return (
            <EmptyState
                title="Missing book id"
                actionLabel="Back"
                onAction={() => nav("/app/books")}
            />
        );

    if (bookQ.isLoading)
        return (
            <div className="text-sm text-muted-foreground">Loading book…</div>
        );

    if (bookQ.isError)
        return (
            <EmptyState
                title="Failed to load book"
                description="Please try again."
                actionLabel="Back to books"
                onAction={() => nav("/app/books")}
            />
        );

    const book = bookQ.data!.book;
    const summary = reviewsQ.data?.ratings ?? { average: 0, count: 0 };

    const reviews = (reviewsQ.data?.reviews ?? []).slice().sort((a, b) => {
        const ad = a.updatedAt || a.createdAt;
        const bd = b.updatedAt || b.createdAt;
        const at = ad ? new Date(ad).getTime() : 0;
        const bt = bd ? new Date(bd).getTime() : 0;
        return bt - at;
    });

    const lastUpdated = myReview?.updatedAt ?? myReview?.createdAt;

    return (
        <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Book</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="text-xl font-semibold">
                            {book.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {book.author}
                        </div>
                        <div className="grid gap-1 pt-2 text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    ISBN:
                                </span>{" "}
                                {book.isbn}
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Category:
                                </span>{" "}
                                {book.category}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <RatingsSummaryCard summary={summary} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Your review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1">
                            <div className="text-sm font-medium">
                                Rating (required)
                            </div>
                            <StarRating value={rating} onChange={setRating} />
                        </div>
                        {lastUpdated ? (
                            <div className="text-right text-xs text-muted-foreground">
                                Last updated
                                <br />
                                {new Date(lastUpdated).toLocaleString()}
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <div className="text-sm font-medium">Review</div>
                        <Textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Write what you thought..."
                            className="min-h-24 max-h-60"
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="destructive"
                            onClick={() => del.mutate()}
                            disabled={!myReview || del.isPending}
                        >
                            {del.isPending ? "Deleting..." : "Delete"}
                        </Button>
                        <Button
                            onClick={() => {
                                if (!rating) {
                                    toast.error("Please select a star rating.");
                                    return;
                                }
                                save.mutate({ rating, text });
                            }}
                            disabled={save.isPending}
                        >
                            {save.isPending ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {reviewsQ.isLoading ? (
                        <div className="text-sm text-muted-foreground">
                            Loading reviews…
                        </div>
                    ) : reviews.length === 0 ? (
                        <EmptyState
                            title="No reviews yet"
                            description="Be the first to leave a review."
                        />
                    ) : (
                        <div className="space-y-3">
                            {reviews.map((r) => (
                                <div
                                    key={r.id}
                                    className="rounded-lg border p-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium">
                                                {r.user.username || "User"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {r.updatedAt || r.createdAt
                                                    ? new Date(
                                                          r.updatedAt ||
                                                              r.createdAt ||
                                                              0,
                                                      ).toLocaleString()
                                                    : ""}
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            <StarRating
                                                value={r.rating}
                                                onChange={() => {}}
                                                size="sm"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    {r.text ? (
                                        <div className="mt-2 text-sm">
                                            {r.text}
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
