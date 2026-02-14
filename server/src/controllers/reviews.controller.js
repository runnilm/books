export function reviewsController({ reviews }) {
    return {
        list: async (req, res) => {
            const result = await reviews.list({ bookId: req.params.id });
            res.json({
                reviews: result.reviews,
                ratings: result.ratings,
            });
        },

        ratings: async (req, res) => {
            const result = await reviews.ratings({ bookId: req.params.id });
            res.json({
                ratings: result,
            });
        },

        add: async (req, res) => {
            const result = await reviews.add({
                bookId: req.params.id,
                userId: req.session.user.id,
                ...req.validated.body,
            });
            res.status(result.created ? 201 : 200).json({
                review: result.review,
            });
        },

        removeMine: async (req, res) => {
            await reviews.removeMine({
                bookId: req.params.id,
                userId: req.session.user.id,
            });
            res.status(204).end();
        },
    };
}
