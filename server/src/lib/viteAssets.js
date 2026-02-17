import fs from "node:fs";
import path from "node:path";

export function loadViteAssets(publicDir) {
    try {
        const manifestPath = path.join(publicDir, ".vite", "manifest.json");
        if (!fs.existsSync(manifestPath)) return { cssHref: null };

        const raw = fs.readFileSync(manifestPath, "utf-8");
        const manifest = JSON.parse(raw);

        const preferredKeys = ["src/main.tsx", "src/main.jsx", "index.html"];

        let entry = null;

        for (const key of preferredKeys) {
            if (manifest[key]) {
                entry = manifest[key];
                break;
            }
        }

        if (!entry) {
            const firstEntryKey = Object.keys(manifest).find(
                (k) => manifest[k]?.isEntry === true,
            );
            if (firstEntryKey) entry = manifest[firstEntryKey];
        }

        const cssFile =
            Array.isArray(entry?.css) && entry.css.length > 0
                ? entry.css[0]
                : null;

        return {
            cssHref: cssFile ? `/${cssFile}` : null,
        };
    } catch {
        return { cssHref: null };
    }
}
