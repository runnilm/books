import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

function serializeReview(doc, username = "") {
    const o = typeof doc?.toObject === "function" ? doc.toObject() : doc;
    return {
        id: String(o?._id ?? o?.id),
        user: {
            id: Number(o?.user_id),
            username,
        },
        rating: o?.rating,
        text: o?.text ?? "",
        createdAt: o?.created_at ? new Date(o.created_at).toISOString() : null,
        updatedAt: o?.updated_at ? new Date(o.updated_at).toISOString() : null,
    };
}

export function reviewsService({ booksRepo, reviewsRepo, users }) {
    return {
        async list({ bookId }) {
            if (!mongoose.isValidObjectId(bookId)) {
                throw new ApiError(400, "Invalid book ID.");
            }

            const book = await booksRepo.findById(bookId);
            if (!book) throw new ApiError(404, "Book not found.");

            const [rawReviews, ratings] = await Promise.all([
                reviewsRepo.listByBookId(bookId),
                reviewsRepo.statsByBookId(bookId),
            ]);

            const userIds = rawReviews.map((r) => r.user_id);
            const usersList = await users.findByIds(userIds);
            const byId = new Map(
                usersList.map((u) => [Number(u.id), String(u.username)]),
            );

            const reviews = rawReviews.map((r) =>
                serializeReview(r, byId.get(Number(r.user_id)) ?? ""),
            );

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

            const { review, created } = await reviewsRepo.upsert({
                bookId,
                userId,
                rating,
                text: text ?? "",
            });

            const [u] = await users.findByIds([userId]);
            const username = u?.username ? String(u.username) : "";

            return { review: serializeReview(review, username), created };
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
