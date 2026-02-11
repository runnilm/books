import { Router } from "express";
import { z } from "zod";
import { validate } from "../../utils/validate.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth } from "../../middleware/requireAuth.js";

const createBody = z.object({
    name: z.string().min(1).max(255),
});

const listBooksQuery = z.object({
    limit: z.coerce.number().int().min(1).max(200).optional().default(100),
    offset: z.coerce.number().int().min(0).max(10000).optional().default(0),
});

const addBookBody = z.object({
    bookId: z.string().min(1),
});

export function collectionsRoutes({ controller }) {
    const router = Router();

    router.get("/", requireAuth, asyncHandler(controller.list));

    router.post(
        "/",
        requireAuth,
        asyncHandler(async (req, res) => {
            req.validated = { body: validate(createBody, req.body) };
            return controller.create(req, res);
        }),
    );

    router.get(
        "/:collectionId/books",
        requireAuth,
        asyncHandler(async (req, res) => {
            req.validated = { query: validate(listBooksQuery, req.query) };
            return controller.listBooks(req, res);
        }),
    );

    router.post(
        "/:collectionId/books",
        requireAuth,
        asyncHandler(async (req, res) => {
            req.validated = { body: validate(addBookBody, req.body) };
            return controller.addBook(req, res);
        }),
    );

    router.delete(
        "/:collectionId/books/:bookId",
        requireAuth,
        asyncHandler(controller.removeBook),
    );

    return router;
}
