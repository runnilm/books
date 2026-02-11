import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
    {
        book_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        user_id: {
            type: Number,
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        text: {
            type: String,
            default: "",
            trim: true,
        },
        created_at: {
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

ReviewSchema.index({
    book_id: 1,
    created_at: -1, // newest first
});

// one review per user per book
ReviewSchema.index(
    {
        book_id: 1,
        user_id: 1,
    },
    {
        unique: true,
    },
);

export const Review = mongoose.model("Review", ReviewSchema);
