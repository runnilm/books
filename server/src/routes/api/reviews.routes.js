import { Router } from "express";
import { z } from "zod";
import { validate } from "../../utils/validate.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { requireAuth } from "../../middleware/requireAuth.js";

const createBody = z.object({
    rating: z.coerce.number().int().min(1).max(5),
    text: z.string().max(5000).optional().default(""),
});

export function reviewsRoutes({ controller }) {
    const router = Router();

    router.get("/:id/reviews", asyncHandler(controller.list));

    router.post(
        "/:id/reviews",
        requireAuth,
        asyncHandler(async (req, res) => {
            req.validated = { body: validate(createBody, req.body) };
            return controller.add(req, res);
        }),
    );

    return router;
}
