# ⚡ AI Toolkit Hub — Backend

Express + MongoDB REST API powering the AI Toolkit Hub. Handles authentication, translation, summarization, flashcard generation, and usage tracking.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB running locally **or** a MongoDB Atlas connection string

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Then open .env and fill in your real values

# 3. Start the dev server (with auto-reload)
npm run dev

# 3b. Or start without auto-reload
npm start
```

The API will be available at `http://localhost:5001`.

---

## ⚙️ Environment Variables

All configuration lives in `.env`. **Never commit this file** — it contains secrets. Use `.env.example` as your template.

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | `development` or `production` |
| `PORT` | No | `5001` | Port the server listens on |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | Secret used to sign JWTs |
| `FRONTEND_URL` | **Yes** | `http://localhost:3000` | Used for CORS and password-reset email links |
| `HUGGINGFACE_API_KEY` | **Yes** | — | Key for the HuggingFace Inference API |
| `HUGGINGFACE_MODEL` | No | `facebook/bart-large-cnn` | HuggingFace model for summarization |
| `HUGGINGFACE_API_URL` | No | Auto-built from model | Full inference endpoint override |
| `GROQ_API_KEY` | **Yes** | — | Key for Groq (flashcard generation) |
| `GROQ_MODEL` | No | `llama-3.3-70b-versatile` | Groq model override |
| `GROQ_API_URL` | No | `https://api.groq.com/openai/v1/chat/completions` | Groq endpoint override |
| `GOOGLE_TRANSLATE_URL` | No | Google public endpoint | Override if proxying translation |
| `MYMEMORY_API_URL` | No | `https://api.mymemory.translated.net` | MyMemory fallback endpoint |
| `EMAIL_HOST` | **Yes** | — | SMTP host (e.g. `smtp.gmail.com`) |
| `EMAIL_PORT` | No | `587` | SMTP port |
| `EMAIL_USER` | **Yes** | — | SMTP login (your email address) |
| `EMAIL_PASS` | **Yes** | — | SMTP password / App Password |
| `EMAIL_FROM` | No | Same as `EMAIL_USER` | From address on outgoing emails |

> **Tip:** Generate a strong JWT secret with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

> **Gmail users:** Create an [App Password](https://myaccount.google.com/apppasswords) — never put your real Google password in `.env`.

---

## 📁 Project Structure

```
backend/
├── server.js                   # Express app entry point
├── .env.example                # Template — copy to .env and fill in values
├── config/
│   └── db.js                   # MongoDB connection
├── middleware/
│   ├── auth.js                 # JWT protect middleware
│   └── errorHandler.js         # Global error handler
├── routes/
│   ├── authRoutes.js
│   ├── translateRoutes.js
│   ├── summarizeRoutes.js
│   ├── flashcardRoutes.js
│   └── dashboardRoutes.js
├── controllers/
│   ├── authController.js
│   ├── translateController.js
│   ├── summarizeController.js
│   ├── flashcardController.js
│   └── dashboardController.js
├── models/
│   ├── User.js
│   ├── TranslationHistory.js
│   ├── SummaryHistory.js
│   ├── Flashcard.js
│   ├── UsageEvent.js
│   ├── ActivityLog.js
│   ├── TTSHistory.js
│   └── VoiceTranslationHistory.js
└── utils/
    └── sendEmail.js            # Nodemailer wrapper
```

---

## 🛠 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Dev server with nodemon (auto-reload) |
| `npm start` | Production server |

---

## 🔌 API Reference

All protected routes require `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Create account |
| `POST` | `/login` | Public | Sign in, returns JWT |
| `GET` | `/profile` | Private | Get current user |
| `POST` | `/forgot-password` | Public | Send password reset email |
| `PUT` | `/reset-password/:token` | Public | Reset password via token |
| `PUT` | `/change-password` | Private | Change password (authenticated) |

### Translate — `/api/translate`

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/` | Private | Translate text (Google → MyMemory fallback) |
| `GET` | `/history` | Private | Get translation history |

### Summarize — `/api/summarize`

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/` | Private | Summarize text (HuggingFace → sentence fallback) |
| `GET` | `/history` | Private | Get summary history |

### Flashcards — `/api/flashcards`

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/generate` | Private | Upload PDF, generate flashcards via Groq |
| `GET` | `/` | Private | Get all flashcard sets |

### Dashboard — `/api/dashboard`

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/summary` | Private | Stats, charts, recent activity |
| `POST` | `/track` | Private | Log a usage event |

---

## 🔐 Authentication Flow

1. `POST /api/auth/register` or `POST /api/auth/login` → returns a JWT
2. Store the JWT in the frontend (`localStorage` or `sessionStorage`)
3. Send it as `Authorization: Bearer <token>` on every protected request
4. The `protect` middleware verifies the token and attaches `req.user`

---

## 🤖 External Services

| Service | Used for | Get key |
|---|---|---|
| **HuggingFace** | Text summarization (`facebook/bart-large-cnn`) | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| **Groq** | Flashcard generation (`llama-3.3-70b-versatile`) | [console.groq.com](https://console.groq.com) |
| **Google Translate** | Primary translation (unofficial endpoint) | No key needed |
| **MyMemory** | Translation fallback | No key needed |
| **Gmail / Brevo SMTP** | Password reset emails | App Password or Brevo SMTP key |

---

## 🌐 Deployment

1. Set all required env variables in your host's environment config (Railway, Render, Heroku, etc.)
2. Set `NODE_ENV=production` — this disables the per-request body logger
3. Set `FRONTEND_URL` to your deployed frontend URL (e.g. `https://app.yourdomain.com`) — this controls CORS
4. Run `npm start`

```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai-toolkit-hub
JWT_SECRET=<long_random_string>
FRONTEND_URL=https://app.yourdomain.com
# ... rest of your keys
```

---

## 🛡️ Security Notes

- Never commit `.env` — it's in `.gitignore`
- Use a long random `JWT_SECRET` (64+ bytes)
- For Gmail, use an [App Password](https://myaccount.google.com/apppasswords), not your real password
- The forgot-password endpoint never reveals whether an email exists (returns the same message either way)
- Passwords are hashed with bcrypt (salt rounds: 10) before storage