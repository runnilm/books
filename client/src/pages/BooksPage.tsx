import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { qk } from "@/lib/queryKeys";
import { API } from "@/lib/endpoints";
import type { Book } from "@/types/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { BookCard } from "@/components/books/BookCard";

function useDebounced<T>(value: T, ms: number) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return v;
}

export function BooksPage() {
    const [sp, setSp] = useSearchParams();
    const initialQ = sp.get("q") ?? "";
    const initialCategory = sp.get("category") ?? "all";

    const [q, setQ] = useState(initialQ);
    const [category, setCategory] = useState(initialCategory);
    const dq = useDebounced(q, 250);

    // URL sync
    useEffect(() => {
        const next = new URLSearchParams(sp);
        const qv = dq.trim();
        if (qv) next.set("q", qv);
        else next.delete("q");

        if (category !== "all") next.set("category", category);
        else next.delete("category");

        setSp(next, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dq, category]);

    const params = useMemo(() => {
        const p: Record<string, string> = {};
        if (dq.trim()) p.q = dq.trim();
        if (category !== "all") p.category = category;
        return p;
    }, [dq, category]);

    const categoriesQ = useQuery({
        queryKey: qk.bookCategories,
        queryFn: () => apiFetch<{ categories: string[] }>(API.books.categories),
    });

    const booksQ = useQuery({
        queryKey: qk.books(params),
        queryFn: async () => {
            const qs = new URLSearchParams(params).toString();
            const url = `${API.books.list}${qs ? `?${qs}` : ""}`;
            return apiFetch<{ books: Book[] }>(url);
        },
    });

    const books = booksQ.data?.books ?? [];
    const categories = categoriesQ.data?.categories ?? [];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-2 sm:flex-[2]">
                    <Label htmlFor="q">Search</Label>
                    <Input
                        id="q"
                        placeholder="Title, author, ISBN, or category..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>

                <div className="space-y-2 sm:flex-1">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {booksQ.isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="rounded-xl border p-4">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="mt-2 h-4 w-1/2" />
                            <Skeleton className="mt-6 h-3 w-1/3" />
                        </div>
                    ))}
                </div>
            ) : books.length === 0 ? (
                <EmptyState
                    title="No books found"
                    description="Try a different search query or category."
                    actionLabel="Clear filters"
                    onAction={() => {
                        setQ("");
                        setCategory("all");
                    }}
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {books.map((b) => (
                        <BookCard key={b.id} book={b} />
                    ))}
                </div>
            )}
        </div>
    );
}
