import type { RatingsSummaryDTO } from "../../types/reviews";

export function RatingsSummary({ ratings }: { ratings: RatingsSummaryDTO }) {
    const avg = Number.isFinite(ratings.average) ? ratings.average : 0;
    const count = Number.isFinite(ratings.count) ? ratings.count : 0;

    return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-sm font-medium">Ratings</div>
            <div className="mt-2 flex items-end gap-3">
                <div className="text-3xl font-semibold tabular-nums">
                    {avg.toFixed(1)}
                </div>
                <div className="text-sm opacity-70">
                    {count} rating{count === 1 ? "" : "s"}
                </div>
            </div>

            {ratings.distribution && (
                <div className="mt-4 space-y-2">
                    {[5, 4, 3, 2, 1].map((s) => {
                        const dist = ratings.distribution ?? {};
                        const v = Number(dist[String(s)] ?? 0);
                        const pct =
                            count > 0 ? Math.round((v / count) * 100) : 0;
                        return (
                            <div
                                key={s}
                                className="flex items-center gap-2 text-xs"
                            >
                                <div className="w-10 opacity-80">{s}★</div>
                                <div className="flex-1 h-2 rounded bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                                    <div
                                        className="h-2 bg-zinc-300 dark:bg-zinc-700"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <div className="w-10 text-right tabular-nums opacity-70">
                                    {v}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
