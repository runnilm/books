export const API = {
    auth: {
        me: "/api/auth/me",
        login: "/api/auth/login",
        register: "/api/auth/register",
        logout: "/api/auth/logout",
    },
    books: {
        list: "/api/books",
        categories: "/api/books/categories",
        detail: (id: string) => `/api/books/${id}`,
        search: "/api/books/search",
    },
    reviews: {
        listForBook: (bookId: string) => `/api/books/${bookId}/reviews`,
        ratingsForBook: (bookId: string) => `/api/books/${bookId}/ratings`,
        upsertForBook: (bookId: string) => `/api/books/${bookId}/reviews`,
        deleteMineForBook: (bookId: string) =>
            `/api/books/${bookId}/reviews/me`,
    },
    collections: {
        list: "/api/collections",
        create: "/api/collections",
        listBooks: (collectionId: number) =>
            `/api/collections/${collectionId}/books`,
        addBook: (collectionId: number) =>
            `/api/collections/${collectionId}/books`,
        removeBook: (collectionId: number, bookId: string) =>
            `/api/collections/${collectionId}/books/${bookId}`,
    },
} as const;
