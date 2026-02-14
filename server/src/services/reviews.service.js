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

            const [reviews, ratings] = await Promise.all([
                reviewsRepo.listByBookId(bookId),
                reviewsRepo.statsByBookId(bookId),
            ]);

            return { reviews, ratings };
        },

        async ratings({ bookId }) {
            if (!mongoose.isValidObjectId(bookId)) {
                throw new ApiError(400, "Invalid book ID.");
            }

            const book = await booksRepo.findById(bookId);
            if (!book) throw new ApiError(404, "Book not found.");

            return reviewsRepo.statsByBookId(bookId);
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

        async removeMine({ bookId, userId }) {
            if (!mongoose.isValidObjectId(bookId)) {
                throw new ApiError(400, "Invalid book ID.");
            }

            const book = await booksRepo.findById(bookId);
            if (!book) throw new ApiError(404, "Book not found.");

            const result = await reviewsRepo.deleteOneByBookAndUser({
                bookId,
                userId,
            });

            if (!result.deleted) throw new ApiError(404, "Review not found.");

            return result;
        },
    };
}
