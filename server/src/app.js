import express from "express";
import helmet from "helmet";
import session from "express-session";
import pgSession from "connect-pg-simple";
import mongoose from "mongoose";
import { errorHandler } from "./middleware/errorHandler.js";

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

    const PgStore = pgSession(session);
    const sessionTtlMs = resolveSessionTtlMs();
    const sessionTtlSeconds = Math.floor(sessionTtlMs / 1000);

    app.use(
        session({
            store: new PgStore({
                pool: pgPool,
                createTableIfMissing: true,
                ttl: sessionTtlSeconds,
                pruneSessionInterval: 60 * 60, // keep the sessions table from growing
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

    app.get("/api/health", async (_req, res) => {
        const r = await pgPool.query("select now() as now");
        const mongoState = mongoose.connection.readyState;
        const mongoOk = mongoState === 1;

        res.json({ ok: true, pg: r.rows[0].now, mongo: mongoOk });
    });

    app.use(routes);

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
