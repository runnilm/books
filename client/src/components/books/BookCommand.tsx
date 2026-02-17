import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CommandDialog,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { API } from "@/lib/endpoints";
import type { Book } from "@/types/api";

function useDebounced<T>(value: T, ms: number) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return v;
}

export function BookCommand() {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const dq = useDebounced(q, 150);
    const nav = useNavigate();

    const [items, setItems] = useState<Book[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen((v) => !v);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        let alive = true;
        async function run() {
            if (!open) return;
            const query = dq.trim();
            if (!query) {
                setItems([]);
                return;
            }
            setLoading(true);
            try {
                const url = `${API.books.search}?q=${encodeURIComponent(query)}&limit=10`;
                const res = await apiFetch<{ books: Book[] }>(url);
                if (alive) setItems(res.books ?? []);
            } catch {
                if (alive) setItems([]);
            } finally {
                if (alive) setLoading(false);
            }
        }
        run();
        return () => {
            alive = false;
        };
    }, [dq, open]);

    return (
        <>
            <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground"
                onClick={() => setOpen(true)}
            >
                <Search className="mr-2 h-4 w-4" />
                <span className="truncate">Search books (Ctrl/⌘ K)</span>
                <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
                    Ctrl/⌘ K
                </span>
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    value={q}
                    onValueChange={setQ}
                    placeholder="Type title, author, ISBN, or category..."
                />
                <CommandList>
                    <CommandEmpty>
                        {loading ? "Searching..." : "No results."}
                    </CommandEmpty>
                    {items.map((b) => (
                        <CommandItem
                            key={b.id}
                            value={`${b.title} ${b.author} ${b.isbn} ${b.category}`}
                            onSelect={() => {
                                setOpen(false);
                                nav(`/app/books/${b.id}`);
                            }}
                        >
                            <div className="min-w-0">
                                <div className="truncate text-sm">
                                    {b.title}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">
                                    {b.author} - {b.isbn} - {b.category}
                                </div>
                            </div>
                        </CommandItem>
                    ))}
                </CommandList>
            </CommandDialog>
        </>
    );
}
