import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/booksApi";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { useDebouncedValue } from "@/lib/debounce";
import { ApiError } from "@/api/fetchJson";
import { BookCard } from "@/components/books/BookCard";

function normalizeParam(v: string | null): string {
    return (v ?? "").trim();
}

function setOrDelete(sp: URLSearchParams, key: string, value: string) {
    const v = value.trim();
    if (v) sp.set(key, v);
    else sp.delete(key);
}

export function BooksPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const qParam = normalizeParam(searchParams.get("q"));
    const categoryParam = normalizeParam(searchParams.get("category"));

    const [qInput, setQInput] = useState(qParam);
    const [categoryInput, setCategoryInput] = useState(categoryParam);

    useEffect(() => setQInput(qParam), [qParam]);
    useEffect(() => setCategoryInput(categoryParam), [categoryParam]);

    const q = useDebouncedValue(qInput, 300);
    const category = categoryInput;

    useEffect(() => {
        const next = new URLSearchParams(searchParams);
        setOrDelete(next, "q", q);
        setOrDelete(next, "category", category);
        setSearchParams(next, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, category]);

    const { data, isLoading, error, isFetching } = useQuery({
        queryKey: ["books", { q, category }],
        queryFn: () => booksApi.list({ q, category }),
        staleTime: 30_000,
    });

    const books = useMemo(() => data ?? [], [data]);

    const categories = useMemo(() => {
        const s = new Set<string>();
        for (const b of books) s.add(b.category);
        return ["", ...Array.from(s).sort()];
    }, [books]);

    const errMsg =
        error instanceof ApiError
            ? error.message
            : error
              ? "Failed to load books."
              : null;

    return (
        <div className="py-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold">Books</h1>
                    <p className="text-sm opacity-70 mt-1">
                        Browse and search the catalog.
                    </p>
                </div>
                {isFetching && !isLoading && (
                    <div className="text-xs opacity-60">Updating…</div>
                )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div>
                    <label className="text-sm font-medium">Search</label>
                    <div className="mt-1">
                        <Input
                            placeholder="Title, author, ISBN…"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium">Category</label>
                    <div className="mt-1">
                        <Select
                            value={categoryInput}
                            onChange={(e) => setCategoryInput(e.target.value)}
                        >
                            <option value="">All</option>
                            {categories
                                .filter((c) => c)
                                .map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                        </Select>
                    </div>
                </div>
            </div>

            {errMsg && (
                <div className="mt-6">
                    <Alert message={errMsg} />
                </div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading
                    ? Array.from({ length: 9 }).map((_, i) => (
                          <div
                              key={i}
                              className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
                          >
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="mt-3 h-4 w-1/2" />
                              <Skeleton className="mt-4 h-8 w-full" />
                          </div>
                      ))
                    : books.map((b) => (
                          <Link
                              key={b._id}
                              to={`/app/books/${b._id}`}
                              className="block"
                          >
                              <BookCard book={b} />
                          </Link>
                      ))}
            </div>
        </div>
    );
}
