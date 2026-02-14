import { execSync } from "node:child_process";

import { env } from "./config/env.js";
import { createPgPool } from "./db/postgres.js";
import { connectMongo } from "./db/mongo.js";
import { createApp } from "./app.js";

import { usersRepo } from "./repositories/postgres/users.repo.js";
import { collectionsRepo } from "./repositories/postgres/collections.repo.js";
import { collectionBooksRepo } from "./repositories/postgres/collectionBooks.repo.js";

import { booksRepo } from "./repositories/mongo/books.repo.js";
import { reviewsRepo } from "./repositories/mongo/reviews.repo.js";

import { authService } from "./services/auth.service.js";
import { booksService } from "./services/books.service.js";
import { reviewsService } from "./services/reviews.service.js";
import { collectionsService } from "./services/collections.service.js";

import { authController } from "./controllers/auth.controller.js";
import { booksController } from "./controllers/books.controller.js";
import { reviewsController } from "./controllers/reviews.controller.js";
import { collectionsController } from "./controllers/collections.controller.js";

import { buildRoutes } from "./routes/index.js";

async function main() {
    // migrations + seed are idempotent
    execSync("node src/db/migrate.js", {
        stdio: "inherit",
        env: process.env,
    });
    execSync("node src/db/seed.js", {
        stdio: "inherit",
        env: process.env,
    });

    const pgPool = createPgPool();
    await pgPool.query("select 1");
    await connectMongo();

    // repos
    const users = usersRepo(pgPool);
    const collections = collectionsRepo(pgPool);
    const collectionBooks = collectionBooksRepo(pgPool);

    // services
    const auth = authService({ users, collections });
    const books = booksService({ booksRepo, reviewsRepo, collectionBooks });
    const reviews = reviewsService({ booksRepo, reviewsRepo, users });
    const userCollections = collectionsService({
        collections,
        collectionBooks,
        booksRepo,
    });

    // controllers
    const controllers = {
        auth: authController({ auth }),
        books: booksController({ books }),
        reviews: reviewsController({ reviews }),
        collections: collectionsController({ collections: userCollections }),
    };

    // routes
    const routes = buildRoutes({ controllers });

    // app
    const app = createApp({ pgPool, routes, env });

    app.listen(env.PORT, () => console.log(`Server listening on :${env.PORT}`));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
