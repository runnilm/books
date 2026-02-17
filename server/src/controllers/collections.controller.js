export function collectionsController({ collections }) {
    function serializeBook(doc) {
        if (!doc) return doc;
        const o = typeof doc.toObject === "function" ? doc.toObject() : doc;
        return {
            id: String(o._id ?? o.id),
            title: o.title,
            author: o.author,
            isbn: o.isbn,
            category: o.category,
            averageRating: Number(o.averageRating ?? 0),
            ratingsCount: Number(o.ratingsCount ?? 0),
        };
    }

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
                books: (books ?? []).map(serializeBook),
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
