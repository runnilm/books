import { ApiError } from "./apiError.js";

export function validate(schema, value) {
    const r = schema.safeParse(value);
    if (!r.success) {
        throw new ApiError(400, "Validation error.", r.error.flatten());
    }
    return r.data;
}
