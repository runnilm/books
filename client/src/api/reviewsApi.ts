import { fetchJson } from "./fetchJson";
import type { ReviewDTO, RatingsSummaryDTO } from "../types/reviews";

type ReviewsResponse = { reviews: ReviewDTO[] } | ReviewDTO[];

function normalizeReviews(res: ReviewsResponse): ReviewDTO[] {
    return Array.isArray(res) ? res : (res.reviews ?? []);
}

type RatingsResponse = { ratings: RatingsSummaryDTO } | RatingsSummaryDTO;

function normalizeRatings(res: RatingsResponse): RatingsSummaryDTO {
    return isRatingsWrapped(res) ? res.ratings : res;
}

function isRatingsWrapped(
    v: RatingsResponse,
): v is { ratings: RatingsSummaryDTO } {
    return typeof v === "object" && v !== null && "ratings" in v;
}

type UpsertReviewResponse = { review: ReviewDTO } | ReviewDTO;

function normalizeUpsert(res: UpsertReviewResponse): ReviewDTO {
    return isReviewWrapped(res) ? res.review : res;
}

function isReviewWrapped(v: UpsertReviewResponse): v is { review: ReviewDTO } {
    return typeof v === "object" && v !== null && "review" in v;
}

export const reviewsApi = {
    async list(bookId: string) {
        const res = await fetchJson<ReviewsResponse>(
            `/api/books/${bookId}/reviews`,
        );
        return normalizeReviews(res);
    },

    async ratings(bookId: string) {
        const res = await fetchJson<RatingsResponse>(
            `/api/books/${bookId}/ratings`,
        );
        const r = normalizeRatings(res);
        return {
            count: Number(r.count ?? 0),
            average: Number(r.average ?? 0),
            distribution: r.distribution ?? null,
        } satisfies RatingsSummaryDTO;
    },

    async upsert(bookId: string, payload: { rating: number; text?: string }) {
        const res = await fetchJson<UpsertReviewResponse>(
            `/api/books/${bookId}/reviews`,
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
        );
        return normalizeUpsert(res);
    },

    async deleteMine(bookId: string) {
        await fetchJson<void>(`/api/books/${bookId}/reviews/me`, {
            method: "DELETE",
        });
    },
};
