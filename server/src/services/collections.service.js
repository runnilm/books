import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

export function collectionsService({
    collections,
    collectionBooks,
    booksRepo,
}) {
    return {
        async list({ userId }) {
            return collections.listByUserId(userId);
        },

        async create({ userId, name }) {
            const trimmed = String(name ?? "").trim();
            if (!trimmed) throw new ApiError(400, "Name required.");

            const existing = await collections.findByUserIdAndName(
                userId,
                trimmed,
            );
            if (existing) {
                throw new ApiError(409, "Collection name already exists.");
            }

            return collections.createCollection({ userId, name: trimmed });
        },

        async listBooks({ userId, collectionId, limit, offset }) {
            const collection = await collections.findById(collectionId);
            if (!collection || collection.user_id !== userId) {
                throw new ApiError(404, "Collection not found.");
            }

            const rows = await collectionBooks.listBookIds({
                collectionId,
                limit,
                offset,
            });

            const ids = rows.map((r) => r.book_id).filter(Boolean);
            if (ids.length === 0) return [];

            const validIds = ids.filter((id) => mongoose.isValidObjectId(id));
            const docs = await booksRepo.findByIds(validIds);

            const byId = new Map(docs.map((b) => [String(b._id), b]));
            return rows.map((r) => byId.get(String(r.book_id))).filter(Boolean);
        },

        async addBook({ userId, collectionId, bookId }) {
            if (!mongoose.isValidObjectId(bookId)) {
                throw new ApiError(400, "Invalid book ID.");
            }

            const collection = await collections.findById(collectionId);
            if (!collection || collection.user_id !== userId) {
                throw new ApiError(404, "Collection not found.");
            }

            const book = await booksRepo.findById(bookId);
            if (!book) throw new ApiError(404, "Book not found.");

            await collectionBooks.add({ collectionId, bookId: String(bookId) });
            return true;
        },

        async removeBook({ userId, collectionId, bookId }) {
            if (!mongoose.isValidObjectId(bookId)) {
                throw new ApiError(400, "Invalid book ID.");
            }

            const collection = await collections.findById(collectionId);
            if (!collection || collection.user_id !== userId) {
                throw new ApiError(404, "Collection not found.");
            }

            const removed = await collectionBooks.remove({
                collectionId,
                bookId: String(bookId),
            });
            if (!removed) throw new ApiError(404, "Book not in collection.");

            return true;
        },
    };
}
