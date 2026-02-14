import { useEffect, useMemo, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    applyTheme,
    getStoredTheme,
    setStoredTheme,
    syncWithSystemThemeIfNeeded,
    type ThemeMode,
} from "@/lib/theme";

const MODES: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: "system", label: "System", icon: <Monitor className="size-4" /> },
    { mode: "light", label: "Light", icon: <Sun className="size-4" /> },
    { mode: "dark", label: "Dark", icon: <Moon className="size-4" /> },
];

export function ThemeToggle() {
    const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme());

    useEffect(() => {
        setStoredTheme(mode);
        applyTheme(mode);
        return syncWithSystemThemeIfNeeded(mode);
    }, [mode]);

    const active = useMemo(
        () => MODES.find((m) => m.mode === mode) ?? MODES[0],
        [mode],
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Theme">
                    {active.icon}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {MODES.map((m) => (
                    <DropdownMenuItem
                        key={m.mode}
                        onClick={() => setMode(m.mode)}
                    >
                        {m.icon}
                        <span className="ml-2">{m.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
