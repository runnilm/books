export function booksController({ books }) {
    return {
        list: async (req, res) => {
            const booksList = await books.list(req.validated.query);
            res.json({
                books: booksList,
            });
        },

        create: async (req, res) => {
            const created = await books.create({
                book: req.validated.body,
            });
            res.status(201).json({
                book: created,
            });
        },

        update: async (req, res) => {
            const updated = await books.update({
                id: req.params.id,
                patch: req.validated.body,
            });
            res.json({
                book: updated,
            });
        },

        remove: async (req, res) => {
            await books.remove({ id: req.params.id });
            res.json({
                ok: true,
            });
        },
    };
}
