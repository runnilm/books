import "dotenv/config";
import bcrypt from "bcrypt";
import pg from "pg";
import mongoose from "mongoose";
import { execSync } from "node:child_process";
import { Book } from "../models/mongo/Book.js";

const { Pool } = pg;

async function seedPostgres(pool) {
    const username = process.env.SEED_ADMIN_USERNAME || "admin";
    const password = process.env.SEED_ADMIN_PASSWORD || "admin123!";
    const passwordHash = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const { rows } = await client.query(
            `
            INSERT INTO users (username, password_hash, is_admin)
            VALUES ($1, $2, true)
            ON CONFLICT (username)
            DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                is_admin = true
            RETURNING id
            `,
            [username, passwordHash],
        );

        const adminId = rows[0]?.id;
        if (!adminId) throw new Error("Failed to upsert admin user.");

        await client.query(
            `
            INSERT INTO user_collections (user_id, name)
            VALUES ($1, 'My Library')
            ON CONFLICT (user_id, name) DO NOTHING
            `,
            [adminId],
        );

        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

async function seedMongo() {
    await Book.init();

    const seedBooks = [
        {
            title: "The Iliad",
            author: "Homer",
            isbn: "9780140275360",
            category: "Epic Poetry",
        },
        {
            title: "The Divine Comedy",
            author: "Dante Alighieri",
            isbn: "9780142437223",
            category: "Epic Poetry",
        },
        {
            title: "Don Quixote",
            author: "Miguel de Cervantes",
            isbn: "9780060934347",
            category: "Novel",
        },
        {
            title: "War and Peace",
            author: "Leo Tolstoy",
            isbn: "9781400079988",
            category: "Novel",
        },
        {
            title: "Hamlet",
            author: "William Shakespeare",
            isbn: "9780743477123",
            category: "Drama",
        },
    ];

    const now = new Date();
    const ops = seedBooks.map((b) => ({
        updateOne: {
            filter: { isbn: b.isbn },
            update: {
                $set: {
                    title: b.title,
                    author: b.author,
                    category: b.category,
                    updated_at: now,
                },
                $setOnInsert: {
                    added_at: now,
                },
            },
            upsert: true,
        },
    }));

    if (ops.length > 0) {
        await Book.bulkWrite(ops, {
            ordered: false,
        });
    }
}

async function main() {
    execSync("npm run db:migrate", {
        stdio: "inherit",
        env: process.env,
    });

    const pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await seedPostgres(pgPool);

        await mongoose.connect(process.env.MONGODB_URI);

        try {
            await seedMongo();
        } finally {
            await mongoose.disconnect();
        }
    } finally {
        await pgPool.end();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
