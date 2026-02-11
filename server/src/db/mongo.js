import mongoose from "mongoose";
import { env } from "../config/env.js";
import { Book } from "../models/mongo/Book.js";
import { Review } from "../models/mongo/Review.js";

export async function connectMongo() {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.MONGODB_URI);
    await Promise.all([Book.init(), Review.init()]);
}
