import { ApiError } from "../utils/apiError.js";

export function requireAdmin(req, _res, next) {
    if (!req.session?.user) return next(new ApiError(401, "Unauthorized"));
    if (!req.session.user.isAdmin) return next(new ApiError(403, "Forbidden"));
    next();
}
