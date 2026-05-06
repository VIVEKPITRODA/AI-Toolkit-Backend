const mongoose = require("mongoose");

const usageEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tool: {
      type: String,
      required: true,
      enum: [
        "auth",
        "translator",
        "summarizer",
        "flashcards",
        "voice",
        "tts",
      ],
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "login",
        "register",
        "translate",
        "summarize",
        "generate_flashcards",
        "voice_translate",
        "speak_text",
      ],
      index: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UsageEvent", usageEventSchema);