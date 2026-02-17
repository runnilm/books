export const qk = {
    me: ["me"] as const,

    books: (params: Record<string, unknown>) => ["books", params] as const,
    book: (id: string) => ["book", id] as const,

    bookCategories: ["bookCategories"] as const,

    reviews: (bookId: string) => ["reviews", bookId] as const,

    collections: ["collections"] as const,
    collectionBooks: (collectionId: number) =>
        ["collectionBooks", collectionId] as const,
} as const;
