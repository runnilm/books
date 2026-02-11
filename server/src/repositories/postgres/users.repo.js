export function usersRepo(pgPool) {
    return {
        async findByUsername(username) {
            const r = await pgPool.query(
                "SELECT id, username, password_hash, is_admin FROM users WHERE username=$1 LIMIT 1",
                [username],
            );
            return r.rows[0] ?? null;
        },

        async createUser({ username, passwordHash, isAdmin }) {
            const r = await pgPool.query(
                "INSERT INTO users (username, password_hash, is_admin) VALUES ($1,$2,$3) RETURNING id, username, is_admin",
                [username, passwordHash, isAdmin],
            );
            return r.rows[0];
        },

        async setAdmin(userId, isAdmin) {
            await pgPool.query("UPDATE users SET is_admin=$2 WHERE id=$1", [
                userId,
                isAdmin,
            ]);
        },
    };
}
