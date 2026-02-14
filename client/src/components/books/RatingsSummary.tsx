import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RatingsSummary } from "@/types/api";

export function RatingsSummaryCard({ summary }: { summary: RatingsSummary }) {
    const avg = Number.isFinite(summary.average)
        ? summary.average.toFixed(1)
        : "0.0";

    const distEntries = summary.distribution
        ? Object.entries(summary.distribution)
              .map(([rating, count]) => ({
                  rating: Number(rating),
                  count: Number(count),
              }))
              .filter(
                  (d) => Number.isFinite(d.rating) && Number.isFinite(d.count),
              )
        : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Ratings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="text-3xl font-semibold">{avg}</div>
                <div className="text-sm text-muted-foreground">
                    {summary.count} rating(s)
                </div>

                {distEntries.length ? (
                    <div className="space-y-1 pt-2">
                        {distEntries
                            .slice()
                            .sort((a, b) => b.rating - a.rating)
                            .map((d) => {
                                const pct = summary.count
                                    ? Math.round(
                                          (d.count / summary.count) * 100,
                                      )
                                    : 0;
                                return (
                                    <div
                                        key={d.rating}
                                        className="flex items-center gap-2 text-xs"
                                    >
                                        <div className="w-10">{d.rating}★</div>
                                        <div className="h-2 flex-1 rounded bg-muted">
                                            <div
                                                className="h-2 rounded bg-foreground/70"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <div className="w-10 text-right">
                                            {d.count}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
