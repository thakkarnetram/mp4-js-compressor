import mongoose from "mongoose";

const AnonymouseSchema = new mongoose.Schema({
    anonId: {
        type: String,
        required: true,
        index: true,
    },
    dateStr: {
        type: String,
        required: true,
        index: true,
    },
    count: {
        type: Number,
        default: 0,
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
})

AnonymouseSchema.index({ anonId: 1, dateStr: 1 }, { unique: true });

const AnonUsage = mongoose.model("anonUsage", AnonymouseSchema);
export { AnonUsage }