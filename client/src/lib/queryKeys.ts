export const qk = {
    me: ["me"] as const,
    books: (params: Record<string, unknown>) => ["books", params] as const,
    book: (id: string) => ["book", id] as const,
    reviews: (bookId: string) => ["reviews", bookId] as const,
    myReview: (bookId: string) => ["myReview", bookId] as const,
};
