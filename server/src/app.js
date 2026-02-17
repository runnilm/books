import express from "express";
import helmet from "helmet";
import session from "express-session";
import pgSession from "connect-pg-simple";
import mongoose from "mongoose";
import { engine } from "express-handlebars";
import { errorHandler } from "./middleware/errorHandler.js";
import { flashMiddleware } from "./middleware/flash.js";
import { loadViteAssets } from "./lib/viteAssets.js";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function createApp({ pgPool, routes, env }) {
    const app = express();

    app.set("trust proxy", 1);
    app.disable("x-powered-by");
    app.use(helmet());

    app.use(express.json());
    app.use(
        express.urlencoded({
            extended: true,
        }),
    );

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // --- static react build + vite assets ---
    const publicDir = path.join(__dirname, "public");
    const indexHtml = path.join(publicDir, "index.html");

    const viteAssets = loadViteAssets(publicDir);

    // --- handlebars ---
    app.engine(
        "hbs",
        engine({
            extname: ".hbs",
            layoutsDir: path.join(__dirname, "views", "layouts"),
            partialsDir: path.join(__dirname, "views", "partials"),
            defaultLayout: "main",
            helpers: {
                eq: (a, b) => a === b,
                or: (...args) => {
                    const vals = args.slice(0, -1);
                    return vals.some(Boolean);
                },
                not: (v) => !v,
            },
        }),
    );
    app.set("view engine", "hbs");
    app.set("views", path.join(__dirname, "views"));

    const PgStore = pgSession(session);
    const sessionTtlMs = resolveSessionTtlMs();
    const sessionTtlSeconds = Math.floor(sessionTtlMs / 1000);

    app.use(
        session({
            store: new PgStore({
                pool: pgPool,
                createTableIfMissing: true,
                ttl: sessionTtlSeconds,
                pruneSessionInterval: 60 * 60,
            }),
            secret: env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                sameSite: "lax",
                maxAge: sessionTtlMs,
                secure: env.NODE_ENV === "production",
            },
        }),
    );

    // flash messages for admin UI
    app.use(flashMiddleware());

    // handlebars template locals
    app.use((req, res, next) => {
        res.locals.user = req.session?.user ?? null;
        res.locals.isAdmin = Boolean(req.session?.user?.isAdmin);
        res.locals.viteCssHref = viteAssets.cssHref;
        next();
    });

    app.get("/api/health", async (_req, res) => {
        const r = await pgPool.query("select now() as now");
        const mongoState = mongoose.connection.readyState;
        const mongoOk = mongoState === 1;

        res.json({ ok: true, pg: r.rows[0].now, mongo: mongoOk });
    });

    // built client
    if (fs.existsSync(publicDir)) {
        app.use(express.static(publicDir));
    }

    // API + admin routes
    app.use(routes);

    // SPA fallback
    app.use((req, res, next) => {
        if (req.method !== "GET") return next();
        if (req.path.startsWith("/api") || req.path.startsWith("/admin"))
            return next();
        if (!fs.existsSync(indexHtml)) return next();
        return res.sendFile(indexHtml);
    });

    app.use(errorHandler);

    return app;
}

function resolveSessionTtlMs() {
    const raw = process.env.SESSION_TTL_MS;
    if (!raw) return 1000 * 60 * 60 * 24 * 7;

    const ms = Number(raw);
    if (!Number.isFinite(ms) || ms <= 0) {
        throw new Error("SESSION_TTL_MS must be a positive number if set.");
    }
    return ms;
}
