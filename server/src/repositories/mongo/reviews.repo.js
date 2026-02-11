import { Review } from "../../models/mongo/Review.js";

export const reviewsRepo = {
    async listByBookId(bookId, limit = 50) {
        return Review.find({ book_id: bookId })
            .sort({ created_at: -1 })
            .limit(limit);
    },

    async upsert({ bookId, userId, rating, text }) {
        const now = new Date();

        const result = await Review.findOneAndUpdate(
            {
                book_id: bookId,
                user_id: userId,
            },
            {
                $set: {
                    rating,
                    text,
                    updated_at: now,
                },
                $setOnInsert: {
                    created_at: now,
                },
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                rawResult: true,
            },
        );

        return {
            review: result.value,
            created: !result.lastErrorObject?.updatedExisting,
        };
    },

    async deleteByBookId(bookId) {
        await Review.deleteMany({ book_id: bookId });
    },
};
