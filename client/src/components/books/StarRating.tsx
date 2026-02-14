import { useMemo } from "react";

export function StarRating({
    value,
    onChange,
    disabled,
    size = "md",
}: {
    value: number; // 0..5
    onChange?: (v: number) => void;
    disabled?: boolean;
    size?: "sm" | "md";
}) {
    const starClass = useMemo(() => {
        const base =
            "inline-flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 " +
            "hover:bg-zinc-50 dark:hover:bg-zinc-900 transition";
        const pad = size === "sm" ? "h-8 w-8 text-sm" : "h-9 w-9 text-base";
        const dis = disabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer";
        return `${base} ${pad} ${dis}`;
    }, [disabled, size]);

    return (
        <div className="flex gap-1">
            {([1, 2, 3, 4, 5] as const).map((n) => {
                const filled = n <= value;
                return (
                    <button
                        key={n}
                        type="button"
                        className={starClass}
                        onClick={disabled ? undefined : () => onChange?.(n)}
                        aria-label={`${n} star`}
                        disabled={disabled}
                    >
                        <span className={filled ? "" : "opacity-30"}>★</span>
                    </button>
                );
            })}
        </div>
    );
}
