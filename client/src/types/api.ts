export type User = { id: number; username: string };

export type Book = {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    averageRating: number;
    ratingsCount: number;
};

export type Review = {
    id: string;
    user: { id: number; username: string };
    rating: number;
    text: string;
    createdAt: string | null;
    updatedAt: string | null;
};

export type RatingsSummary = {
    average: number;
    count: number;
    distribution?: Record<string, number>;
};
