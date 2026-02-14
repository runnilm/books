import { Router } from "express";
import { z } from "zod";
import { validate } from "../../utils/validate.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";

const listQuery = z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(50),
    offset: z.coerce.number().int().min(0).max(10000).optional().default(0),
});

const createBody = z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    isbn: z.string().min(1),
    category: z.string().min(1),
});

const updateBody = z
    .object({
        title: z.string().min(1).optional(),
        author: z.string().min(1).optional(),
        isbn: z.string().min(1).optional(),
        category: z.string().min(1).optional(),
    })
    .strict();

export function booksRoutes({ controller }) {
    const router = Router();

    router.get(
        "/",
        asyncHandler(async (req, res) => {
            req.validated = { query: validate(listQuery, req.query) };
            return controller.list(req, res);
        }),
    );

    router.get(
        "/search",
        asyncHandler(async (req, res) => {
            req.validated = { query: validate(listQuery, req.query) };
            return controller.list(req, res);
        }),
    );

    router.get("/:id", asyncHandler(controller.getById));

    router.post(
        "/",
        requireAdmin,
        asyncHandler(async (req, res) => {
            req.validated = { body: validate(createBody, req.body) };
            return controller.create(req, res);
        }),
    );

    router.put(
        "/:id",
        requireAdmin,
        asyncHandler(async (req, res) => {
            req.validated = { body: validate(updateBody, req.body) };
            return controller.update(req, res);
        }),
    );

    router.delete("/:id", requireAdmin, asyncHandler(controller.remove));

    return router;
}
