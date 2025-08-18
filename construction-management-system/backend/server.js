const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");

dotenv.config();

const app = express();
app.use(express.json());

// CORS: during dev you can allow all; in prod set your frontend origin explicitly
app.use(cors({ origin: true, credentials: false }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Start server + DB
const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`🚀 API listening on :${PORT}`)))
  .catch((e) => {
    console.error("DB connect failed:", e.message);
    process.exit(1);
  });
