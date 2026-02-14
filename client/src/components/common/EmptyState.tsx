import { Button } from "@/components/ui/button";

export function EmptyState({
    title,
    description,
    actionLabel,
    onAction,
}: {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}) {
    return (
        <div className="flex min-h-60 flex-col items-center justify-center gap-2 text-center">
            <div className="text-sm font-medium">{title}</div>
            {description && (
                <div className="max-w-md text-sm text-muted-foreground">
                    {description}
                </div>
            )}
            {actionLabel && onAction && (
                <Button variant="outline" onClick={onAction} className="mt-2">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
