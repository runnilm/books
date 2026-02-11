import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const sql = fs.readFileSync(path.join(__dirname, "migrate.sql"), "utf8");

    try {
        await pool.query(sql);
    } finally {
        await pool.end();
    }
}

migrate().catch((err) => {
    console.error("Failed migration: ", err);
    process.exit(1);
});
