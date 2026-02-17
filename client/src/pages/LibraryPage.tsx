import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { API } from "@/lib/endpoints";
import { qk } from "@/lib/queryKeys";
import { useMe } from "@/lib/auth";
import type { Book } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type CollectionsResponse = {
    collections: { id: number; name: string; created_at?: string }[];
};

type CollectionBooksResponse = {
    books: Book[];
};

export function LibraryPage() {
    const me = useMe();
    const qc = useQueryClient();
    const nav = useNavigate();

    const collectionId = me.data?.user?.collectionId ?? null;

    const collectionsQ = useQuery({
        queryKey: qk.collections,
        queryFn: () => apiFetch<CollectionsResponse>(API.collections.list),
    });

    const libraryQ = useQuery({
        queryKey: collectionId ? qk.collectionBooks(collectionId) : ["noop"],
        queryFn: () =>
            apiFetch<CollectionBooksResponse>(
                `${API.collections.listBooks(collectionId as number)}?limit=200&offset=0`,
            ),
        enabled: typeof collectionId === "number",
    });

    const removeMutation = useMutation({
        mutationFn: async (bookId: string) => {
            if (typeof collectionId !== "number")
                throw new Error("No collection available.");
            return apiFetch<void>(
                API.collections.removeBook(collectionId, bookId),
                { method: "DELETE" },
            );
        },
        onSuccess: async () => {
            if (typeof collectionId === "number") {
                await qc.invalidateQueries({
                    queryKey: qk.collectionBooks(collectionId),
                });
            }
        },
    });

    const books = libraryQ.data?.books ?? [];

    return (
        <div className="space-y-4">
            {collectionsQ.isLoading || libraryQ.isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : books.length === 0 ? (
                <EmptyState
                    title="Your library is empty"
                    description="Browse books and add some to your library."
                    actionLabel="Browse books"
                    onAction={() => nav("/app/books")}
                />
            ) : (
                <div className="space-y-2">
                    {books.map((b) => (
                        <Card key={b.id}>
                            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <div className="truncate font-medium">
                                        <Button
                                            variant="link"
                                            className="h-auto p-0"
                                            onClick={() =>
                                                nav(`/app/books/${b.id}`)
                                            }
                                        >
                                            {b.title}
                                        </Button>
                                    </div>
                                    <div className="truncate text-sm text-muted-foreground">
                                        {b.author} - ISBN {b.isbn} -{" "}
                                        {b.category}
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    disabled={removeMutation.isPending}
                                    onClick={async () => {
                                        try {
                                            await removeMutation.mutateAsync(
                                                b.id,
                                            );
                                            toast.success(
                                                "Removed from your library",
                                            );
                                        } catch (e) {
                                            toast.error(
                                                e instanceof Error
                                                    ? e.message
                                                    : "Failed to remove book",
                                            );
                                        }
                                    }}
                                >
                                    {removeMutation.isPending
                                        ? "Removing…"
                                        : "Remove"}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
