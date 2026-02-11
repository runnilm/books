import { ApiError } from "../utils/apiError.js";

export function requireAuth(req, _res, next) {
    if (!req.session?.user) return next(new ApiError(401, "Unauthorized"));
    next();
}
