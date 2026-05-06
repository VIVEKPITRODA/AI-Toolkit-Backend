// backend/models/SummaryHistory.js
const mongoose = require("mongoose");

const summaryHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalText: {
      type: String,
      required: true,
    },
    summaryText: {
      type: String,
      required: true,
    },
    summaryLength: {
      type: String,
      enum: ["short", "medium", "long"],
      default: "medium",
    },
    outputFormat: {
      type: String,
      enum: ["paragraph", "bullets", "tldr"],
      default: "paragraph",
    },
    wordCount: {
      original: { type: Number, default: 0 },
      summary:  { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

summaryHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("SummaryHistory", summaryHistorySchema);