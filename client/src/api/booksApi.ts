import { fetchJson } from "./fetchJson";
import type { BookDTO } from "../types/dto";

type BooksListResponse = { books: BookDTO[] } | BookDTO[];

function normalizeBooks(res: BooksListResponse): BookDTO[] {
    if (Array.isArray(res)) return res;
    return res.books ?? [];
}

export const booksApi = {
    async list(params: { q?: string; category?: string }) {
        const usp = new URLSearchParams();
        if (params.q) usp.set("q", params.q);
        if (params.category) usp.set("category", params.category);

        const res = await fetchJson<BooksListResponse>(
            `/api/books?${usp.toString()}`,
        );
        return normalizeBooks(res);
    },
};
