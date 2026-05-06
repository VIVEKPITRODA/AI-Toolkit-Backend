const UsageEvent = require("../models/UsageEvent");

const TOOL_LABELS = {
  translator: "Translator",
  summarizer: "Summarizer",
  flashcards: "Flashcards",
  voice: "Voice Translator",
  tts: "TTS",
};

const TOOL_COLORS = {
  translator: "#63b3ed",
  summarizer: "#9a75ea",
  flashcards: "#f6c90e",
  voice: "#68d391",
  tts: "#fc8181",
};

const TOOL_ICONS = {
  auth: "🔐",
  translator: "🌐",
  summarizer: "📝",
  flashcards: "🃏",
  voice: "🎙️",
  tts: "🔊",
};

const formatRelativeTime = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;

  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

const getLast7Days = () => {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setHours(0, 0, 0, 0);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  return days;
};

// POST /api/dashboard/track
const trackUsage = async (req, res) => {
  try {
    const { tool, action, meta = {} } = req.body;

    if (!tool || !action) {
      return res.status(400).json({ message: "tool and action are required" });
    }

    const event = await UsageEvent.create({
      userId: req.user._id,
      tool,
      action,
      meta,
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard/summary
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const [allEvents, recentEvents] = await Promise.all([
      UsageEvent.find({ userId }).sort({ createdAt: -1 }),
      UsageEvent.find({ userId }).sort({ createdAt: -1 }).limit(10),
    ]);

    const totalRequests = allEvents.length;
    const registrations = allEvents.filter((e) => e.action === "register").length;
    const logins = allEvents.filter((e) => e.action === "login").length;
    const pdfsProcessed = allEvents.filter(
      (e) => e.action === "generate_flashcards"
    ).length;
    const flashcardSets = pdfsProcessed;

    const toolUsage = {
      translator: allEvents.filter((e) => e.tool === "translator").length,
      summarizer: allEvents.filter((e) => e.tool === "summarizer").length,
      flashcards: allEvents.filter((e) => e.tool === "flashcards").length,
      voice: allEvents.filter((e) => e.tool === "voice").length,
      tts: allEvents.filter((e) => e.tool === "tts").length,
    };

    const pieData = Object.entries(toolUsage).map(([key, value]) => ({
      name: TOOL_LABELS[key],
      value,
      color: TOOL_COLORS[key],
    }));

    const weeklyDates = getLast7Days();

    const usageData = weeklyDates.map((date) => {
      const next = new Date(date);
      next.setDate(date.getDate() + 1);

      const dayEvents = allEvents.filter((e) => {
        const created = new Date(e.createdAt);
        return created >= date && created < next;
      });

      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        translations: dayEvents.filter((e) => e.tool === "translator").length,
        summaries: dayEvents.filter((e) => e.tool === "summarizer").length,
        flashcards: dayEvents.filter((e) => e.tool === "flashcards").length,
        voice: dayEvents.filter((e) => e.tool === "voice").length,
        tts: dayEvents.filter((e) => e.tool === "tts").length,
      };
    });

    const recentActivity = recentEvents.map((item) => ({
      id: item._id,
      tool:
        item.tool === "auth"
          ? item.action === "login"
            ? "Login"
            : "Registration"
          : TOOL_LABELS[item.tool],
      action:
        item.action === "login"
          ? `Signed in as ${req.user.email}`
          : item.action === "register"
          ? "Created account"
          : item.meta?.summary ||
            item.meta?.title ||
            item.meta?.textPreview ||
            item.action,
      time: formatRelativeTime(item.createdAt),
      icon: TOOL_ICONS[item.tool] || "⚡",
    }));

    const stats = [
      {
        label: "Total Requests",
        value: String(totalRequests),
        delta: `${logins} logins`,
        icon: "⚡",
        color: "#63b3ed",
      },
      {
        label: "Registrations",
        value: String(registrations),
        delta: "Accounts created",
        icon: "🆕",
        color: "#9a75ea",
      },
      {
        label: "PDFs Processed",
        value: String(pdfsProcessed),
        delta: "Flashcard uploads",
        icon: "📄",
        color: "#68d391",
      },
      {
        label: "Flashcard Sets",
        value: String(flashcardSets),
        delta: "Generated sets",
        icon: "🃏",
        color: "#f6c90e",
      },
    ];

    const tools = [
      {
        id: "translator",
        name: "Language Translator",
        desc: "Translate text across 50+ languages instantly",
        icon: "🌐",
        color: "#63b3ed",
        bg: "rgba(99,179,237,0.08)",
        border: "rgba(99,179,237,0.2)",
        uses: toolUsage.translator,
        path: "/tools/translator",
      },
      {
        id: "summarizer",
        name: "Text Summarizer",
        desc: "Condense long articles into key insights",
        icon: "📝",
        color: "#9a75ea",
        bg: "rgba(154,117,234,0.08)",
        border: "rgba(154,117,234,0.2)",
        uses: toolUsage.summarizer,
        path: "/tools/summarizer",
      },
      {
        id: "flashcards",
        name: "PDF Flashcards",
        desc: "Auto-generate Q&A flashcards from any PDF",
        icon: "🃏",
        color: "#f6c90e",
        bg: "rgba(246,201,14,0.08)",
        border: "rgba(246,201,14,0.2)",
        uses: toolUsage.flashcards,
        path: "/tools/flashcards",
      },
      {
        id: "voice",
        name: "Voice Translator",
        desc: "Speak and hear real-time translations",
        icon: "🎙️",
        color: "#68d391",
        bg: "rgba(104,211,145,0.08)",
        border: "rgba(104,211,145,0.2)",
        uses: toolUsage.voice,
        path: "/tools/voice-translator",
      },
      {
        id: "tts",
        name: "Text-to-Speech",
        desc: "Convert any text to natural sounding audio",
        icon: "🔊",
        color: "#fc8181",
        bg: "rgba(252,129,129,0.08)",
        border: "rgba(252,129,129,0.2)",
        uses: toolUsage.tts,
        path: "/tools/tts",
      },
    ];

    res.json({
      success: true,
      data: {
        stats,
        usageData,
        pieData,
        recentActivity,
        tools,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  trackUsage,
  getDashboardSummary,
};