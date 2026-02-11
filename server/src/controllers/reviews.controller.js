export function reviewsController({ reviews }) {
    return {
        list: async (req, res) => {
            const items = await reviews.list({ bookId: req.params.id });
            res.json({
                reviews: items,
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
    };
}
