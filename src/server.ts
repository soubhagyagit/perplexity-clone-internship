import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { CONFIG, updateConfig, loadConfig } from "./config/env.js";
import { refreshModels } from "./config/models.js";
import {
  AGENT_REGISTRY,
  AgentMode,
  dispatchStreamingAgent,
  dispatchListAgent,
} from "./agents/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

const publicPath = path.resolve(__dirname, "../public");
app.use(express.static(publicPath));

/**
 * Health & Diagnostics Check
 */
app.get("/api/health", async (req: Request, res: Response) => {
  let searxngOnline = false;
  try {
    const check = await fetch(`${CONFIG.SEARXNG_URL}/stats`, { signal: AbortSignal.timeout(2000) });
    searxngOnline = check.ok;
  } catch {
    searxngOnline = false;
  }

  res.json({
    status: "healthy",
    version: "1.0.0",
    engine: "NexusAI Agentic Core",
    searxng: {
      url: CONFIG.SEARXNG_URL,
      status: searxngOnline ? "connected" : "fallback_mode",
    },
    llm: {
      groq_configured: Boolean(CONFIG.GROQ_API_KEY && CONFIG.GROQ_API_KEY.length > 8 && !CONFIG.GROQ_API_KEY.includes("your_groq")),
      gemini_configured: Boolean(CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY.length > 8 && !CONFIG.GEMINI_API_KEY.includes("your_gemini")),
    },
  });
});

/**
 * Configuration management API
 */
app.get("/api/config", (req: Request, res: Response) => {
  const maskKey = (k: string) => (k && k.length > 8 ? `${k.slice(0, 5)}...${k.slice(-4)}` : "");
  res.json({
    groq_api_key_masked: maskKey(CONFIG.GROQ_API_KEY),
    gemini_api_key_masked: maskKey(CONFIG.GEMINI_API_KEY),
    searxng_url: CONFIG.SEARXNG_URL,
    groq_model: CONFIG.GROQ_MODEL,
    groq_configured: Boolean(CONFIG.GROQ_API_KEY && CONFIG.GROQ_API_KEY.length > 8 && !CONFIG.GROQ_API_KEY.includes("your_groq")),
    gemini_configured: Boolean(CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY.length > 8 && !CONFIG.GEMINI_API_KEY.includes("your_gemini")),
  });
});

app.post("/api/config", (req: Request, res: Response) => {
  const { groq_api_key, gemini_api_key, searxng_url, groq_model } = req.body;

  const updates: any = {};
  if (typeof groq_api_key === "string" && groq_api_key.trim()) {
    updates.GROQ_API_KEY = groq_api_key.trim();
  }
  if (typeof gemini_api_key === "string" && gemini_api_key.trim()) {
    updates.GEMINI_API_KEY = gemini_api_key.trim();
  }
  if (typeof searxng_url === "string" && searxng_url.trim()) {
    updates.SEARXNG_URL = searxng_url.trim();
  }
  if (typeof groq_model === "string" && groq_model.trim()) {
    updates.GROQ_MODEL = groq_model.trim();
  }

  updateConfig(updates);
  refreshModels();

  res.json({
    success: true,
    message: "Configuration updated and applied successfully!",
    config: {
      searxng_url: CONFIG.SEARXNG_URL,
      groq_configured: Boolean(CONFIG.GROQ_API_KEY && CONFIG.GROQ_API_KEY.length > 8),
      gemini_configured: Boolean(CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY.length > 8),
    },
  });
});

/**
 * Get registered agent metadata
 */
app.get("/api/agents", (req: Request, res: Response) => {
  res.json({
    success: true,
    agents: Object.values(AGENT_REGISTRY),
  });
});

/**
 * SSE Streaming endpoint
 */
app.get("/api/search/stream", (req: Request, res: Response) => {
  const mode = (req.query.mode as AgentMode) || "web";
  const query = (req.query.query as string) || "";
  const historyRaw = (req.query.history as string) || "[]";

  let chatHistory: any[] = [];
  try {
    chatHistory = JSON.parse(historyRaw);
  } catch {
    chatHistory = [];
  }

  if (!query.trim()) {
    res.status(400).json({ error: "Query parameter is required." });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const emitter = dispatchStreamingAgent(mode, query, chatHistory);

  emitter.on("data", (chunkStr: string) => {
    res.write(`data: ${chunkStr}\n\n`);
  });

  emitter.on("end", () => {
    res.write(`data: ${JSON.stringify({ type: "end" })}\n\n`);
    res.end();
  });

  emitter.on("error", (err: any) => {
    res.write(`data: ${JSON.stringify({ type: "error", data: String(err) })}\n\n`);
    res.end();
  });

  req.on("close", () => {
    emitter.removeAllListeners();
  });
});

/**
 * Listing endpoints
 */
app.get("/api/search/list", async (req: Request, res: Response) => {
  const mode = (req.query.mode as AgentMode) || "image";
  const query = (req.query.query as string) || "";
  const historyRaw = (req.query.history as string) || "[]";

  let chatHistory: any[] = [];
  try {
    chatHistory = JSON.parse(historyRaw);
  } catch {
    chatHistory = [];
  }

  try {
    const results = await dispatchListAgent(mode, query, chatHistory);
    res.json({
      success: true,
      mode,
      data: results,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || String(err),
    });
  }
});

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(CONFIG.PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 NexusAI Server listening on http://localhost:${CONFIG.PORT}`);
  console.log(`  🔍 SearXNG: ${CONFIG.SEARXNG_URL}`);
  console.log(`  🔑 Groq Configured: ${Boolean(CONFIG.GROQ_API_KEY)} | Gemini Configured: ${Boolean(CONFIG.GEMINI_API_KEY)}`);
  console.log(`  🌐 Web UI: http://localhost:${CONFIG.PORT}`);
  console.log(`======================================================\n`);
});
