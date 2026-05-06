// backend/controllers/summarizeController.js
const axios = require("axios");
const UsageEvent = require("../models/UsageEvent");
const SummaryHistory = require("../models/SummaryHistory");

// Model endpoint is env-driven so you can swap models without code changes
const HUGGINGFACE_MODEL =
  process.env.HUGGINGFACE_MODEL ||
  "facebook/bart-large-cnn"; // ← model name was hardcoded

const HUGGINGFACE_API_URL =
  process.env.HUGGINGFACE_API_URL ||
  `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`; // ← URL was hardcoded

const fallbackSummarize = (text, length = "medium") => {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  if (sentences.length === 0) return text.slice(0, 300);

  const count =
    length === "short" ? 2 :
    length === "long"  ? 6 : 4;

  return sentences.slice(0, count).join(" ");
};

// @desc    Summarize text
// @route   POST /api/summarize
// @access  Private
const summarizeText = async (req, res) => {
  try {
    const { text, length = "medium", style = "paragraph" } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Please provide text to summarize" });
    }

    let summary = "";

    try {
      const response = await axios.post(
        HUGGINGFACE_API_URL, // ← was hardcoded URL
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      summary =
        response.data?.[0]?.summary_text ||
        response.data?.summary_text ||
        "";
    } catch (hfError) {
      console.log("Hugging Face failed, using fallback summary");
      console.log(hfError.response?.data || hfError.message);
      summary = fallbackSummarize(text, length);
    }

    const wordCount = {
      original: text.trim().split(/\s+/).length,
      summary: summary.trim().split(/\s+/).length,
    };

    await SummaryHistory.create({
      userId: req.user._id,
      originalText: text,
      summaryText: summary,
      summaryLength: length,
      outputFormat: style,
      wordCount,
    });

    await UsageEvent.create({
      userId: req.user._id,
      tool: "summarizer",
      action: "summarize",
      meta: {
        summary: `Created ${length} ${style} summary`,
        textPreview: text.slice(0, 80),
        length,
        style,
        wordCount: wordCount.original,
      },
    });

    return res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Summarizer error:", error);
    return res.status(500).json({ message: "Summarization failed" });
  }
};

// @desc    Get summary history
// @route   GET /api/summarize/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    let history = [];

    try {
      history = await SummaryHistory.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);

      if (history.length > 0) {
        return res.status(200).json({
          success: true,
          count: history.length,
          data: history,
        });
      }
    } catch {
      // SummaryHistory collection might not exist yet — fall through
    }

    // Fallback: UsageEvent
    history = await UsageEvent.find({
      userId: req.user._id,
      tool: "summarizer",
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { summarizeText, getHistory };