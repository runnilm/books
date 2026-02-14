import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function StarRating({
    value,
    onChange,
    size = "md",
    readOnly = false,
}: {
    value: number;
    onChange: (v: number) => void;
    size?: "sm" | "md";
    readOnly?: boolean;
}) {
    const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
                const idx = i + 1;
                const filled = idx <= value;
                return (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => !readOnly && onChange(idx)}
                        className={cn(
                            "rounded p-1",
                            !readOnly && "hover:bg-accent",
                        )}
                        aria-label={`${idx} stars`}
                        disabled={readOnly}
                    >
                        <Star
                            className={cn(icon, filled ? "fill-current" : "")}
                        />
                    </button>
                );
            })}
        </div>
    );
}
