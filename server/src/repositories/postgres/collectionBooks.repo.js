export function collectionBooksRepo(pgPool) {
    return {
        async add({ collectionId, bookId }) {
            const r = await pgPool.query(
                `
                    INSERT INTO collection_books (collection_id, book_id)
                    VALUES ($1, $2)
                    ON CONFLICT (collection_id, book_id)
                    DO UPDATE SET book_id = EXCLUDED.book_id
                    RETURNING collection_id, book_id, added_at
                `,
                [collectionId, bookId],
            );
            return r.rows[0];
        },

        async remove({ collectionId, bookId }) {
            const r = await pgPool.query(
                `
                    DELETE FROM collection_books
                    WHERE collection_id = $1 AND book_id = $2
                    RETURNING collection_id, book_id
                `,
                [collectionId, bookId],
            );
            return r.rows[0] ?? null;
        },

        async listBookIds({ collectionId, limit = 200, offset = 0 }) {
            const r = await pgPool.query(
                `
                    SELECT book_id, added_at
                    FROM collection_books
                    WHERE collection_id = $1
                    ORDER BY added_at DESC
                    LIMIT $2 OFFSET $3
                `,
                [collectionId, limit, offset],
            );
            return r.rows;
        },

        async deleteByBookId(bookId) {
            await pgPool.query(
                "DELETE FROM collection_books WHERE book_id = $1",
                [bookId],
            );
        },
    };
}
