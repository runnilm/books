export type ReviewDTO = {
    _id?: string;
    book_id: string;
    user_id: number;
    username?: string;
    rating: number; // 1-5
    text?: string | null;
    updated_at?: string;
    created_at?: string;
};

export type RatingsSummaryDTO = {
    count: number;
    average: number; // 0..5
    distribution?: Record<string, number> | null;
};
