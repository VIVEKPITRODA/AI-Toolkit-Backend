const axios = require("axios");
const Flashcard = require("../models/Flashcard");
const UsageEvent = require("../models/UsageEvent");

// Groq endpoint and model are env-driven so swapping providers needs no code change
const GROQ_API_URL =
  process.env.GROQ_API_URL ||
  "https://api.groq.com/openai/v1/chat/completions"; // ← was hardcoded

const GROQ_MODEL =
  process.env.GROQ_MODEL ||
  "llama-3.3-70b-versatile"; // ← was hardcoded

const extractTextFromPDF = async (buffer) => {
  const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return fullText;
};

const generateFlashcards = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF file" });
    }

    let text = "";
    try {
      const extracted = await extractTextFromPDF(req.file.buffer);
      text = extracted.substring(0, 3000);
    } catch (pdfErr) {
      console.error("PDF parse error:", pdfErr.message);
      return res.status(400).json({ message: "Could not read PDF. Please try another file." });
    }

    if (!text || text.length < 20) {
      return res.status(400).json({ message: "Could not extract text from PDF." });
    }

    const response = await axios.post(
      GROQ_API_URL, // ← was hardcoded
      {
        model: GROQ_MODEL, // ← was hardcoded
        messages: [
          {
            role: "system",
            content:
              "You are a flashcard generator. Always respond with ONLY a valid JSON array. No explanation, no markdown, no code blocks — just raw JSON.",
          },
          {
            role: "user",
            content: `Generate 10 flashcards from the following text. Return ONLY a JSON array like this:
[
  { "question": "...", "answer": "..." }
]

Text:
${text}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const rawContent = response.data.choices[0].message.content.trim();

    let flashcards = [];
    try {
      const cleaned = rawContent.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        flashcards = parsed
          .filter((c) => c.question && c.answer)
          .map((c) => ({
            question: String(c.question).trim(),
            answer: String(c.answer).trim(),
            difficulty: "medium",
          }));
      }
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr.message);
      return res.status(500).json({ message: "Failed to parse flashcards from AI response." });
    }

    if (flashcards.length === 0) {
      return res.status(500).json({ message: "No flashcards were generated." });
    }

    const savedFlashcard = await Flashcard.create({
      userId: req.user._id,
      title: req.body.title || "Untitled Flashcard Set",
      sourceFileName: req.file.originalname,
      flashcards,
    });

    await UsageEvent.create({
      userId: req.user._id,
      tool: "flashcards",
      action: "generate_flashcards",
      meta: {
        title: savedFlashcard.title,
        summary: `Generated ${savedFlashcard.flashcards.length} cards from "${savedFlashcard.title}"`,
        cardCount: savedFlashcard.flashcards.length,
        sourceFileName: req.file?.originalname || "",
      },
    });

    res.status(201).json({ success: true, data: savedFlashcard });
  } catch (error) {
    console.error("Flashcard error FULL:", error.stack);
    res.status(500).json({
      message: error.response?.data?.error?.message || error.message || "Server error",
    });
  }
};

const getFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: flashcards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateFlashcards, getFlashcards };