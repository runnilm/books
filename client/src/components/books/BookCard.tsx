import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Book } from "@/types/api";
import { Link } from "react-router-dom";

export function BookCard({ book }: { book: Book }) {
    return (
        <Link to={`/app/books/${book.id}`}>
            <Card className="transition-colors hover:bg-accent/40">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="truncate font-medium">
                                {book.title}
                            </div>
                            <div className="truncate text-sm text-muted-foreground">
                                {book.author}
                            </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                            {book.category}
                        </Badge>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                        ISBN: {book.isbn}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
