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

    // create admin if missing
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
        `
        INSERT INTO users (username, password_hash, is_admin)
        VALUES ($1, $2, true)
        ON CONFLICT (username)
        DO UPDATE SET is_admin = true
        `,
        [username, passwordHash],
    );
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
