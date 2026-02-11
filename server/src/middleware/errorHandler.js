import { ApiError } from "../utils/apiError.js";

export function errorHandler(err, req, res, _next) {
    const isApi = req.path.startsWith("/api/");
    const status = err instanceof ApiError ? err.status : 500;

    // log full error server-side
    console.error(err);

    if (isApi) {
        return res.status(status).json({
            error: status === 500 ? "Server Error" : err.message,
            ...(err instanceof ApiError && err.details
                ? { details: err.details }
                : {}),
        });
    }

    return res
        .status(status)
        .send(status === 500 ? "Internal Server Error" : err.message);
}
