import bcrypt from "bcrypt";
import { ApiError } from "../utils/apiError.js";

export function authService({ users, collections }) {
    return {
        async register({ username, password }) {
            const existing = await users.findByUsername(username);
            if (existing) throw new ApiError(409, "Username already exists.");

            const passwordHash = await bcrypt.hash(password, 10);
            const user = await users.createUser({
                username,
                passwordHash,
                isAdmin: false,
            });

            const collection = await collections.createCollection({
                userId: user.id,
                name: "My Library",
            });

            return {
                id: user.id,
                username: user.username,
                isAdmin: user.is_admin,
                collectionId: collection.id,
            };
        },

        async login({ username, password }) {
            const user = await users.findByUsername(username);
            if (!user) throw new ApiError(401, "Invalid credentials.");

            const ok = await bcrypt.compare(password, user.password_hash);
            if (!ok) throw new ApiError(401, "Invalid credentials.");

            const collection = await collections.findFirstByUserId(user.id);

            return {
                id: user.id,
                username: user.username,
                isAdmin: user.is_admin,
                collectionId: collection?.id ?? null,
            };
        },
    };
}
