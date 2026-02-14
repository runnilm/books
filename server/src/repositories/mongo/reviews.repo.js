import mongoose from "mongoose";
import { Review } from "../../models/mongo/Review.js";

export const reviewsRepo = {
    async listByBookId(bookId, limit = 50) {
        return Review.find({ book_id: bookId })
            .sort({ created_at: -1 })
            .limit(limit);
    },

    async statsByBookId(bookId) {
        const _id = new mongoose.Types.ObjectId(bookId);

        const [row] = await Review.aggregate([
            { $match: { book_id: _id } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    average: { $avg: "$rating" },
                    r1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
                    r2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
                    r3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
                    r4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
                    r5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
                },
            },
            {
                $project: {
                    _id: 0,
                    count: 1,
                    average: { $ifNull: ["$average", 0] },
                    distribution: {
                        1: "$r1",
                        2: "$r2",
                        3: "$r3",
                        4: "$r4",
                        5: "$r5",
                    },
                },
            },
        ]);

        return (
            row ?? {
                count: 0,
                average: 0,
                distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            }
        );
    },

    async statsByBookIds(bookIds) {
        const ids = (bookIds ?? [])
            .map((id) => (typeof id === "string" ? id : String(id?._id ?? id)))
            .filter((id) => mongoose.isValidObjectId(id))
            .map((id) => new mongoose.Types.ObjectId(id));

        if (ids.length === 0) return new Map();

        const rows = await Review.aggregate([
            { $match: { book_id: { $in: ids } } },
            {
                $group: {
                    _id: "$book_id",
                    count: { $sum: 1 },
                    average: { $avg: "$rating" },
                },
            },
            {
                $project: {
                    _id: 0,
                    bookId: "$_id",
                    count: 1,
                    average: { $ifNull: ["$average", 0] },
                },
            },
        ]);

        const map = new Map();
        for (const r of rows) {
            map.set(String(r.bookId), {
                count: Number(r.count ?? 0),
                average: Number(r.average ?? 0),
            });
        }
        return map;
    },

    async upsert({ bookId, userId, rating, text }) {
        const now = new Date();

        const result = await Review.findOneAndUpdate(
            { book_id: bookId, user_id: userId },
            {
                $set: { rating, text, updated_at: now },
                $setOnInsert: { created_at: now },
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

    async deleteOneByBookAndUser({ bookId, userId }) {
        const result = await Review.deleteOne({
            book_id: bookId,
            user_id: userId,
        });
        return { deleted: (result.deletedCount ?? 0) > 0 };
    },

    async deleteByBookId(bookId) {
        await Review.deleteMany({ book_id: bookId });
    },
};
