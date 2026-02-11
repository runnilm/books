export function collectionsController({ collections }) {
    return {
        list: async (req, res) => {
            const items = await collections.list({
                userId: req.session.user.id,
            });
            res.json({
                collections: items,
            });
        },

        create: async (req, res) => {
            const created = await collections.create({
                userId: req.session.user.id,
                name: req.validated.body.name,
            });
            res.status(201).json({
                collection: created,
            });
        },

        listBooks: async (req, res) => {
            const books = await collections.listBooks({
                userId: req.session.user.id,
                collectionId: Number(req.params.collectionId),
                ...req.validated.query,
            });
            res.json({
                books,
            });
        },

        addBook: async (req, res) => {
            await collections.addBook({
                userId: req.session.user.id,
                collectionId: Number(req.params.collectionId),
                bookId: req.validated.body.bookId,
            });
            res.status(201).json({
                ok: true,
            });
        },

        removeBook: async (req, res) => {
            await collections.removeBook({
                userId: req.session.user.id,
                collectionId: Number(req.params.collectionId),
                bookId: req.params.bookId,
            });
            res.json({
                ok: true,
            });
        },
    };
}
