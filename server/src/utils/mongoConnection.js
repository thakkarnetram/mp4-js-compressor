import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()

export async function connectDatabase () {
    try {
        await mongoose.connect(process.env.ATLAS_URI)
        console.log("Connected To DB")
    } catch (err) {
        console.error("Error connecting to DB:", err);
    }
}
