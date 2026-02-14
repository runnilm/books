import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";

function useDebounced(value: string, ms: number) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return v;
}

export type HeaderBookSearchProps = {
    /** Optional initial value, e.g. from URL query param */
    initialQuery?: string;
};

export function HeaderBookSearch({ initialQuery = "" }: HeaderBookSearchProps) {
    const [q, setQ] = useState(initialQuery);
    const dq = useDebounced(q, 200);
    const nav = useNavigate();

    useEffect(() => {
        const trimmed = dq.trim();
        const params = new URLSearchParams();
        if (trimmed) params.set("q", trimmed);
        nav(`/app/books${params.toString() ? `?${params.toString()}` : ""}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dq]);

    return (
        <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search books…"
            className="w-65 sm:w-90"
        />
    );
}

export default HeaderBookSearch;
