export function getSearchParam(search: string, key: string): string | null {
    try {
        const usp = new URLSearchParams(search);
        const v = usp.get(key);
        return v && v.length > 0 ? v : null;
    } catch {
        return null;
    }
}
