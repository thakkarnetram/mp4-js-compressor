import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: false
  },
  status: {
    type: String,
    enum: ["pending", "processing", "done", "error"],
    default: "pending"
  },
  crf: {
    type: Number,
    required: true
  },
  files: [{
    originalName: {
      type: String,
      required: true
    },
    inputPath: {
      type: String,
      required: true
    },
    outputPath: {
      type: String
    }
  }],
  error: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
});

export default mongoose.model("job", JobSchema);