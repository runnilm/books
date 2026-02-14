import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { booksApi } from "@/api/booksApi";
import type { BookDTO } from "@/types/dto";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

function filterBooks(books: BookDTO[], q: string) {
    const s = q.trim().toLowerCase();
    if (!s) return books.slice(0, 20);
    return books
        .filter((b) =>
            (b.title + " " + b.author + " " + b.isbn).toLowerCase().includes(s),
        )
        .slice(0, 20);
}

export function HeaderBookSearch() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            const isK = e.key.toLowerCase() === "k";
            if ((e.ctrlKey || e.metaKey) && isK) {
                e.preventDefault();
                setOpen((v) => !v);
            }
            if (e.key === "Escape") setOpen(false);
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const { data: books = [], isLoading } = useQuery({
        queryKey: ["books", "index"],
        queryFn: () => booksApi.list({}),
        staleTime: 5 * 60_000,
    });

    const filtered = useMemo(() => filterBooks(books, query), [books, query]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-65 justify-start gap-2 text-muted-foreground"
                >
                    <Search className="size-4" />
                    <span className="text-sm">Search books…</span>
                    <span className="ml-auto text-xs opacity-60">Ctrl K</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-90 p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Type a title, author, or ISBN…"
                    />
                    <CommandList>
                        <CommandEmpty>
                            {isLoading ? "Loading…" : "No books found."}
                        </CommandEmpty>
                        <CommandGroup heading="Books">
                            {filtered.map((b) => (
                                <CommandItem
                                    key={b._id}
                                    value={b._id}
                                    onSelect={() => {
                                        setOpen(false);
                                        setQuery("");
                                        navigate(`/app/books/${b._id}`);
                                    }}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm">
                                            {b.title}
                                        </span>
                                        <span className="text-xs opacity-70">
                                            {b.author}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
