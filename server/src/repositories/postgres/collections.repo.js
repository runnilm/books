export function collectionsRepo(pgPool) {
    return {
        async createCollection({ userId, name }) {
            const r = await pgPool.query(
                "INSERT INTO user_collections (user_id, name) VALUES ($1,$2) RETURNING id, user_id, name",
                [userId, name],
            );
            return r.rows[0];
        },

        async listByUserId(userId) {
            const r = await pgPool.query(
                "SELECT id, user_id, name FROM user_collections WHERE user_id=$1 ORDER BY id ASC",
                [userId],
            );
            return r.rows;
        },

        async findById(id) {
            const r = await pgPool.query(
                "SELECT id, user_id, name FROM user_collections WHERE id=$1 LIMIT 1",
                [id],
            );
            return r.rows[0] ?? null;
        },

        async findFirstByUserId(userId) {
            const r = await pgPool.query(
                "SELECT id, user_id, name FROM user_collections WHERE user_id=$1 ORDER BY id ASC LIMIT 1",
                [userId],
            );
            return r.rows[0] ?? null;
        },

        async findByUserIdAndName(userId, name) {
            const r = await pgPool.query(
                "SELECT id, user_id, name FROM user_collections WHERE user_id=$1 AND name=$2 LIMIT 1",
                [userId, name],
            );
            return r.rows[0] ?? null;
        },
    };
}
