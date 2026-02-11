import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

export function reviewsService({ booksRepo, reviewsRepo }) {
    return {
        async list({ bookId }) {
            if (!mongoose.isValidObjectId(bookId)) {
                throw new ApiError(400, "Invalid book ID.");
            }

            const book = await booksRepo.findById(bookId);
            if (!book) throw new ApiError(404, "Book not found.");

            return reviewsRepo.listByBookId(bookId);
        },

        async add({ bookId, userId, rating, text }) {
            if (!mongoose.isValidObjectId(bookId)) {
                throw new ApiError(400, "Invalid book ID.");
            }

            const book = await booksRepo.findById(bookId);
            if (!book) throw new ApiError(404, "Book not found.");

            return reviewsRepo.upsert({
                bookId,
                userId,
                rating,
                text: text ?? "",
            });
        },
    };
}
