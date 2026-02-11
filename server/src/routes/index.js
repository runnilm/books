import { Router } from "express";
import { authRoutes } from "./api/auth.routes.js";
import { booksRoutes } from "./api/books.routes.js";
import { reviewsRoutes } from "./api/reviews.routes.js";
import { collectionsRoutes } from "./api/collections.routes.js";

export function buildRoutes({ controllers }) {
    const router = Router();

    router.use(
        "/api/auth",
        authRoutes({
            controller: controllers.auth,
        }),
    );
    router.use(
        "/api/books",
        booksRoutes({
            controller: controllers.books,
        }),
    );
    router.use(
        "/api/books",
        reviewsRoutes({
            controller: controllers.reviews,
        }),
    );
    router.use(
        "/api/collections",
        collectionsRoutes({
            controller: controllers.collections,
        }),
    );

    return router;
}
