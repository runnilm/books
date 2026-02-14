import type { BookDTO } from "../../types/dto";

export function BookCard({ book }: { book: BookDTO }) {
    return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
            <div className="text-base font-semibold leading-snug">
                {book.title}
            </div>
            <div className="mt-1 text-sm opacity-80">{book.author}</div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-zinc-100 dark:bg-zinc-900 px-2 py-1">
                    {book.category}
                </span>
                <span className="rounded-full bg-zinc-100 dark:bg-zinc-900 px-2 py-1">
                    ISBN: {book.isbn}
                </span>
            </div>
        </div>
    );
}
