import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

export function createPgPool() {
    return new Pool({
        connectionString: env.DATABASE_URL,
    });
}
