import { Book } from "../../models/mongo/Book.js";

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const booksRepo = {
    async list({ q, category, limit = 100, offset = 0 }) {
        const filter = {};
        if (category) filter.category = String(category);

        const qText = String(q ?? "").trim();
        let mongoQuery = filter;

        if (qText) {
            const re = new RegExp(escapeRegex(qText), "i");
            mongoQuery = {
                ...filter,
                $or: [{ title: re }, { author: re }, { isbn: re }],
            };
        }

        return Book.find(mongoQuery)
            .sort({ added_at: -1 })
            .skip(offset)
            .limit(limit);
    },

    async findByIds(ids) {
        return Book.find({
            _id: {
                $in: ids,
            },
        });
    },

    async create(data) {
        return Book.create({
            ...data,
            updated_at: new Date(),
        });
    },

    async updateById(id, patch) {
        return Book.findByIdAndUpdate(
            id,
            {
                ...patch,
                updated_at: new Date(),
            },
            {
                new: true,
                runValidators: true,
            },
        );
    },

    async deleteById(id) {
        return Book.findByIdAndDelete(id);
    },

    async findById(id) {
        return Book.findById(id);
    },
};
