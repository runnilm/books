import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BookDTO } from "@/types/dto";
import type { ReviewDTO } from "@/types/reviews";
import { fetchJson, ApiError } from "@/api/fetchJson";
import { reviewsApi } from "@/api/reviewsApi";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/books/StarRating";
import { RatingsSummary } from "@/components/books/RatingsSummary";
import { useAuth } from "@/auth/auth";
import { computeRatingsFromReviews } from "@/lib/ratings";

type BookResponse = { book: BookDTO } | BookDTO;

function isBookWrapped(v: BookResponse): v is { book: BookDTO } {
    return typeof v === "object" && v !== null && "book" in v;
}

function normalizeBook(res: BookResponse): BookDTO {
    return isBookWrapped(res) ? res.book : res;
}

function formatDate(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString();
}

function sortReviewsNewestFirst(list: ReviewDTO[]): ReviewDTO[] {
    return [...list].sort((a, b) => {
        const ad = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
        const bd = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
        return bd - ad;
    });
}

function ReviewForm({
    myReview,
    userId,
    onSave,
    onDelete,
    isBusy,
    formError,
}: {
    myReview: ReviewDTO | null;
    userId: number | null;
    onSave: (payload: { rating: number; text?: string }) => void;
    onDelete: () => void;
    isBusy: boolean;
    formError: string | null;
}) {
    const [rating, setRating] = useState<number>(myReview?.rating ?? 0);
    const [text, setText] = useState<string>(myReview?.text ?? "");

    return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Your review</div>
                {myReview?.updated_at && (
                    <div className="text-xs opacity-60">
                        Last updated: {formatDate(myReview.updated_at)}
                    </div>
                )}
            </div>

            {formError && (
                <div className="mt-3">
                    <Alert title="Review error" message={formError} />
                </div>
            )}

            <div className="mt-3">
                <div className="text-xs font-medium opacity-80">Rating</div>
                <div className="mt-1">
                    <StarRating
                        value={rating}
                        onChange={setRating}
                        disabled={isBusy}
                    />
                </div>
                {rating === 0 && (
                    <div className="mt-2 text-xs opacity-60">
                        Select a rating to enable saving.
                    </div>
                )}
            </div>

            <div className="mt-3">
                <div className="text-xs font-medium opacity-80">
                    Review (optional)
                </div>
                <div className="mt-1">
                    <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write a short review…"
                        rows={4}
                        disabled={isBusy}
                    />
                </div>
            </div>

            {/* Buttons bottom-right */}
            <div className="mt-4 flex justify-end gap-2">
                {myReview && (
                    <Button
                        variant="secondary"
                        onClick={onDelete}
                        disabled={isBusy}
                    >
                        Delete
                    </Button>
                )}

                <Button
                    onClick={() => {
                        if (!userId) return;
                        if (rating < 1 || rating > 5) return;
                        onSave({ rating, text: text.trim() || undefined });
                    }}
                    disabled={isBusy || !userId || rating < 1}
                >
                    {isBusy
                        ? "Saving…"
                        : myReview
                          ? "Save changes"
                          : "Save review"}
                </Button>
            </div>
        </div>
    );
}

export function BookDetailPage() {
    const { id } = useParams<{ id: string }>();
    const bookId = id ?? "";
    const nav = useNavigate();
    const { user } = useAuth();
    const qc = useQueryClient();

    const bookQuery = useQuery({
        queryKey: ["book", bookId],
        enabled: Boolean(bookId),
        queryFn: async () => {
            const res = await fetchJson<BookResponse>(`/api/books/${bookId}`);
            return normalizeBook(res);
        },
        staleTime: 5 * 60_000,
    });

    const reviewsQuery = useQuery({
        queryKey: ["reviews", bookId],
        enabled: Boolean(bookId),
        queryFn: async () =>
            sortReviewsNewestFirst(await reviewsApi.list(bookId)),
        staleTime: 10_000,
    });

    const book = bookQuery.data ?? null;

    const reviews = useMemo(() => reviewsQuery.data ?? [], [reviewsQuery.data]);
    const ratings = useMemo(
        () => computeRatingsFromReviews(reviews),
        [reviews],
    );

    const myReview = useMemo(() => {
        if (!user) return null;
        return reviews.find((r) => r.user_id === user.id) ?? null;
    }, [reviews, user]);

    const [formError, setFormError] = useState<string | null>(null);

    const upsertMutation = useMutation({
        mutationFn: (payload: { rating: number; text?: string }) =>
            reviewsApi.upsert(bookId, payload),

        onMutate: async (payload) => {
            setFormError(null);
            if (!user) throw new ApiError(401, "You must be logged in.");

            await qc.cancelQueries({ queryKey: ["reviews", bookId] });

            const previous =
                qc.getQueryData<ReviewDTO[]>(["reviews", bookId]) ?? [];

            const optimistic: ReviewDTO = {
                ...(myReview ?? {}),
                book_id: bookId,
                user_id: user.id,
                username: user.username, // ensure name exists for your review
                rating: payload.rating,
                text: payload.text ?? null,
                updated_at: new Date().toISOString(),
            };

            const next = (() => {
                const exists = previous.some((r) => r.user_id === user.id);
                const merged = exists
                    ? previous.map((r) =>
                          r.user_id === user.id ? { ...r, ...optimistic } : r,
                      )
                    : [{ ...optimistic }, ...previous];
                return sortReviewsNewestFirst(merged);
            })();

            qc.setQueryData(["reviews", bookId], next);

            return { previous };
        },

        onError: (err, _payload, ctx) => {
            if (ctx?.previous)
                qc.setQueryData(["reviews", bookId], ctx.previous);

            if (err instanceof ApiError) {
                setFormError(
                    err.status === 401
                        ? "You must be logged in."
                        : err.message || "Failed to save review.",
                );
            } else {
                setFormError("Failed to save review.");
            }
        },

        onSuccess: (saved) => {
            if (!user) return;

            const current =
                qc.getQueryData<ReviewDTO[]>(["reviews", bookId]) ?? [];
            const next = sortReviewsNewestFirst(
                current.map((r) =>
                    r.user_id === user.id
                        ? {
                              ...r,
                              ...saved,
                              username: saved.username ?? user.username,
                          }
                        : r,
                ),
            );
            qc.setQueryData(["reviews", bookId], next);
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["reviews", bookId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: () => reviewsApi.deleteMine(bookId),

        onMutate: async () => {
            setFormError(null);
            if (!user) throw new ApiError(401, "You must be logged in.");

            await qc.cancelQueries({ queryKey: ["reviews", bookId] });

            const previous =
                qc.getQueryData<ReviewDTO[]>(["reviews", bookId]) ?? [];
            const next = sortReviewsNewestFirst(
                previous.filter((r) => r.user_id !== user.id),
            );
            qc.setQueryData(["reviews", bookId], next);

            return { previous };
        },

        onError: (err, _vars, ctx) => {
            if (ctx?.previous)
                qc.setQueryData(["reviews", bookId], ctx.previous);

            if (err instanceof ApiError) {
                setFormError(
                    err.status === 401
                        ? "You must be logged in."
                        : err.message || "Failed to delete review.",
                );
            } else {
                setFormError("Failed to delete review.");
            }
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["reviews", bookId] });
        },
    });

    const isHeaderLoading = bookQuery.isLoading && !bookQuery.data;
    const isReviewsLoading = reviewsQuery.isLoading && reviews.length === 0;

    const bookErrorMessage = useMemo(() => {
        if (!bookQuery.error) return null;
        if (bookQuery.data) return null;
        const err = bookQuery.error;
        if (err instanceof ApiError)
            return err.status === 404
                ? "Book not found."
                : err.message || "Failed to load book.";
        return "Failed to load book.";
    }, [bookQuery.error, bookQuery.data]);

    if (bookErrorMessage) {
        return (
            <div className="py-6">
                <div className="flex items-center gap-2 text-sm opacity-70">
                    <Link className="underline" to="/app/books">
                        Back
                    </Link>
                </div>
                <div className="mt-4">
                    <Alert title="Book error" message={bookErrorMessage} />
                    <div className="mt-4">
                        <Button
                            variant="secondary"
                            onClick={() => nav("/app/books")}
                        >
                            Go to books
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const formKey = `${bookId}:${user?.id ?? "anon"}:${myReview?._id ?? "none"}:${myReview?.updated_at ?? "na"}`;

    return (
        <div className="py-6">
            <div className="flex items-center gap-2 text-sm opacity-70">
                <Link className="underline" to="/app/books">
                    Back
                </Link>
            </div>

            {/* Top row: Book info (left) + Ratings (right) */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                    {isHeaderLoading ? (
                        <>
                            <Skeleton className="h-7 w-2/3" />
                            <Skeleton className="mt-2 h-4 w-1/3" />
                            <div className="mt-4 flex gap-2">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-32 rounded-full" />
                            </div>
                        </>
                    ) : book ? (
                        <>
                            <div className="text-2xl font-semibold leading-snug">
                                {book.title}
                            </div>
                            <div className="mt-1 text-sm opacity-80">
                                {book.author}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full bg-zinc-100 dark:bg-zinc-900 px-2 py-1">
                                    {book.category}
                                </span>
                                <span className="rounded-full bg-zinc-100 dark:bg-zinc-900 px-2 py-1">
                                    ISBN: {book.isbn}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="text-sm opacity-70">
                            No book selected.
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <RatingsSummary ratings={ratings} />
                </div>
            </div>

            {book && bookQuery.isFetching && (
                <div className="mt-2 text-xs opacity-60">Refreshing book…</div>
            )}

            {/* Your review: full-width row */}
            <div className="mt-3">
                <ReviewForm
                    key={formKey}
                    myReview={myReview}
                    userId={user?.id ?? null}
                    isBusy={
                        upsertMutation.isPending || deleteMutation.isPending
                    }
                    formError={formError}
                    onSave={(payload) => upsertMutation.mutate(payload)}
                    onDelete={() => deleteMutation.mutate()}
                />
            </div>

            {/* Reviews list */}
            <div className="mt-4 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="text-sm font-medium">All reviews</div>

                <div className="mt-3 space-y-3">
                    {isReviewsLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-sm opacity-70">
                            No reviews yet.
                        </div>
                    ) : (
                        reviews.map((r) => {
                            const displayName =
                                user && r.user_id === user.id
                                    ? user.username
                                    : r.username?.trim()
                                      ? r.username
                                      : `User ${r.user_id}`;

                            return (
                                <div
                                    key={
                                        r._id ??
                                        `${r.user_id}-${r.created_at ?? ""}`
                                    }
                                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="text-sm font-medium">
                                            {displayName}
                                            {user && r.user_id === user.id && (
                                                <span className="ml-2 text-xs opacity-60">
                                                    (you)
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs opacity-60">
                                            {formatDate(
                                                r.updated_at ?? r.created_at,
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="text-sm tabular-nums">
                                            {r.rating.toFixed(0)}/5
                                        </div>
                                        <div className="text-xs opacity-60">
                                            ★
                                        </div>
                                    </div>

                                    {r.text && (
                                        <div className="mt-2 text-sm opacity-90 whitespace-pre-wrap">
                                            {r.text}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {reviews.length > 0 && reviewsQuery.isFetching && (
                    <div className="mt-3 text-xs opacity-60">
                        Refreshing reviews…
                    </div>
                )}
            </div>
        </div>
    );
}
