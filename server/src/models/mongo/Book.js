import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        author: {
            type: String,
            required: true,
            trim: true,
        },
        isbn: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        added_at: {
            type: Date,
            default: Date.now,
        },
        updated_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        versionKey: false,
    },
);

BookSchema.index({
    title: "text",
    author: "text",
});
BookSchema.index({
    category: 1,
});

export const Book = mongoose.model("Book", BookSchema);
