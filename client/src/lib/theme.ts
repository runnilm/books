export type ThemeMode = "system" | "light" | "dark";

const KEY = "theme";

function prefersDark() {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function applyResolvedTheme(resolved: "light" | "dark") {
    const root = document.documentElement;
    if (resolved === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
}

export function getStoredTheme(): ThemeMode {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
    return "system";
}

export function setStoredTheme(mode: ThemeMode) {
    localStorage.setItem(KEY, mode);
}

export function applyTheme(mode: ThemeMode) {
    if (mode === "system") {
        applyResolvedTheme(prefersDark() ? "dark" : "light");
        return;
    }
    applyResolvedTheme(mode);
}

/**
 * If mode === "system", keep the applied theme in sync with OS changes.
 * Returns an unsubscribe cleanup.
 */
export function syncWithSystemThemeIfNeeded(mode: ThemeMode) {
    if (mode !== "system") return () => {};

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");

    // modern + fallback
    mql.addEventListener?.("change", handler);
    mql.addListener?.(handler);

    return () => {
        mql.removeEventListener?.("change", handler);
        mql.removeListener?.(handler);
    };
}
