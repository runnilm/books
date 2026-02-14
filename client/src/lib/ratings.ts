import type { RatingsSummaryDTO, ReviewDTO } from "../types/reviews";

export function computeRatingsFromReviews(
    reviews: ReviewDTO[],
): RatingsSummaryDTO {
    const dist: Record<string, number> = {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
    };

    let sum = 0;
    let count = 0;

    for (const r of reviews) {
        const rating = Number(r.rating);
        if (!Number.isFinite(rating)) continue;
        if (rating < 1 || rating > 5) continue;

        count += 1;
        sum += rating;

        const key = String(rating);
        dist[key] = (dist[key] ?? 0) + 1;
    }

    const average = count > 0 ? sum / count : 0;

    return {
        count,
        average,
        distribution: dist,
    };
}
