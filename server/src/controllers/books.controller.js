export function booksController({ books }) {
    function serializeBook(doc) {
        if (!doc) return doc;
        const o = typeof doc.toObject === "function" ? doc.toObject() : doc;
        return {
            id: String(o._id ?? o.id),
            title: o.title,
            author: o.author,
            isbn: o.isbn,
            category: o.category,
        };
    }

    return {
        getById: async (req, res) => {
            const book = await books.getById({ id: req.params.id });
            res.json({ book: serializeBook(book) });
        },

        list: async (req, res) => {
            const booksList = await books.list(req.validated.query);
            res.json({ books: booksList.map(serializeBook) });
        },

        create: async (req, res) => {
            const created = await books.create({ book: req.validated.body });
            res.status(201).json({ book: serializeBook(created) });
        },

        update: async (req, res) => {
            const updated = await books.update({
                id: req.params.id,
                patch: req.validated.body,
            });
            res.json({ book: serializeBook(updated) });
        },

        remove: async (req, res) => {
            await books.remove({ id: req.params.id });
            res.json({ ok: true });
        },
    };
}
