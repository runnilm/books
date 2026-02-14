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
            return book;
        },

        async list({ q, category, limit, offset }) {
            return booksRepo.list({ q, category, limit, offset });
        },

        async create({ book }) {
            try {
                return await booksRepo.create(book);
            } catch (err) {
                if (err?.code === 11000)
                    throw new ApiError(409, "ISBN already exists.");
                throw err;
            }
        },

        async update({ id, patch }) {
            if (!mongoose.isValidObjectId(id))
                throw new ApiError(400, "Invalid book ID.");

            const updated = await booksRepo.updateById(id, patch);
            if (!updated) throw new ApiError(404, "Not found.");
            return updated;
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
