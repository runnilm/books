import { Router } from "express";
import { z } from "zod";
import { validate } from "../../utils/validate.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

const bodySchema = z.object({
    username: z.string().min(1).max(100),
    password: z.string().min(1).max(200),
});

export function authRoutes({ controller }) {
    const router = Router();

    router.post(
        "/register",
        asyncHandler(async (req, res) => {
            req.validated = { body: validate(bodySchema, req.body) };
            return controller.register(req, res);
        }),
    );

    router.post(
        "/login",
        asyncHandler(async (req, res) => {
            req.validated = { body: validate(bodySchema, req.body) };
            return controller.login(req, res);
        }),
    );

    router.post("/logout", asyncHandler(controller.logout));
    router.get("/me", asyncHandler(controller.me));

    return router;
}
