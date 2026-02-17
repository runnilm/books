import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

export function booksService({ booksRepo, reviewsRepo, collectionBooks }) {
    return {
        async getById({ id }) {
            if (!mongoose.isValidObjectId(id)) {
                throw new ApiError(400, "Invalid book ID.");
            }

            const book = await booksRepo.findById(id);
            if (!book) throw new ApiError(404, "Not found.");

            const stats = await reviewsRepo.statsByBookId(id);

            const o =
                typeof book.toObject === "function" ? book.toObject() : book;
            return {
                ...o,
                averageRating: stats.average,
                ratingsCount: stats.count,
            };
        },

        async list({ q, category, limit, offset }) {
            const docs = await booksRepo.list({ q, category, limit, offset });
            const ids = docs.map((d) => String(d._id));
            const statsMap = await reviewsRepo.statsByBookIds(ids);

            return docs.map((d) => {
                const o = typeof d.toObject === "function" ? d.toObject() : d;
                const stats = statsMap.get(String(o._id)) ?? {
                    average: 0,
                    count: 0,
                };
                return {
                    ...o,
                    averageRating: stats.average,
                    ratingsCount: stats.count,
                };
            });
        },

        async categories() {
            return booksRepo.listCategories();
        },

        async create({ book }) {
            try {
                const created = await booksRepo.create(book);
                const o =
                    typeof created.toObject === "function"
                        ? created.toObject()
                        : created;
                return { ...o, averageRating: 0, ratingsCount: 0 };
            } catch (err) {
                if (err?.code === 11000)
                    throw new ApiError(409, "ISBN already exists.");
                throw err;
            }
        },

        async update({ id, patch }) {
            if (!mongoose.isValidObjectId(id))
                throw new ApiError(400, "Invalid book ID.");

            let updated;
            try {
                updated = await booksRepo.updateById(id, patch);
            } catch (err) {
                if (err?.code === 11000)
                    throw new ApiError(409, "ISBN already exists.");
                throw err;
            }
            if (!updated) throw new ApiError(404, "Not found.");

            const stats = await reviewsRepo.statsByBookId(id);
            const o =
                typeof updated.toObject === "function"
                    ? updated.toObject()
                    : updated;
            return {
                ...o,
                averageRating: stats.average,
                ratingsCount: stats.count,
            };
        },

        async remove({ id }) {
            if (!mongoose.isValidObjectId(id))
                throw new ApiError(400, "Invalid book ID.");

            const deleted = await booksRepo.deleteById(id);
            if (!deleted) throw new ApiError(404, "Not found.");

            await Promise.all([
                reviewsRepo.deleteByBookId(id),
                collectionBooks.deleteByBookId(id),
            ]);

            return true;
        },
    };
}
