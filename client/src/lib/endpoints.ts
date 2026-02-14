export const API = {
    auth: {
        me: "/api/auth/me",
        login: "/api/auth/login",
        register: "/api/auth/register",
        logout: "/api/auth/logout",
    },
    books: {
        list: "/api/books", // GET ?q=&category=
        detail: (id: string) => `/api/books/${id}`, // GET
        search: "/api/books/search", // GET ?q=&category=&limit=&offset=
    },
    reviews: {
        listForBook: (bookId: string) => `/api/books/${bookId}/reviews`, // GET
        ratingsForBook: (bookId: string) => `/api/books/${bookId}/ratings`, // GET
        upsertForBook: (bookId: string) => `/api/books/${bookId}/reviews`, // POST
        deleteMineForBook: (bookId: string) =>
            `/api/books/${bookId}/reviews/me`, // DELETE
    },
} as const;
