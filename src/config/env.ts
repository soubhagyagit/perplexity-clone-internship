import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function findEnvFile(): string | null {
  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env.txt"),
    path.resolve(__dirname, "../../.env"),
    path.resolve(__dirname, "../../.env.local"),
    path.resolve(__dirname, "../../.env.txt"),
    path.resolve(__dirname, "../../.env.example"),
    path.resolve(process.env.USERPROFILE || "C:\\Users\\soubh", "Desktop/perplexity clone/.env"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

export function loadConfig() {
  const envFile = findEnvFile();
  if (envFile) {
    dotenv.config({ path: envFile, override: true });
  } else {
    dotenv.config({ override: true });
  }

  return {
    PORT: parseInt(process.env.PORT || "3000", 10),
    SEARXNG_URL: (process.env.SEARXNG_URL || "http://localhost:8888").replace(/\/$/, ""),
    GROQ_API_KEY: process.env.GROQ_API_KEY || "",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
    GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    GROQ_FAST_MODEL: process.env.GROQ_FAST_MODEL || "llama-3.1-8b-instant",
  };
}

export let CONFIG = loadConfig();

export function updateConfig(newValues: Partial<typeof CONFIG>) {
  if (newValues.GROQ_API_KEY !== undefined) process.env.GROQ_API_KEY = newValues.GROQ_API_KEY;
  if (newValues.GEMINI_API_KEY !== undefined) {
    process.env.GEMINI_API_KEY = newValues.GEMINI_API_KEY;
    process.env.GOOGLE_API_KEY = newValues.GEMINI_API_KEY;
  }
  if (newValues.SEARXNG_URL !== undefined) process.env.SEARXNG_URL = newValues.SEARXNG_URL;
  if (newValues.GROQ_MODEL !== undefined) process.env.GROQ_MODEL = newValues.GROQ_MODEL;

  CONFIG = loadConfig();

  // Persist to .env at project root
  const rootEnvPath = path.resolve(process.cwd(), ".env");
  const envContent = `# NexusAI Configuration
PORT=${CONFIG.PORT}
SEARXNG_URL=${CONFIG.SEARXNG_URL}

GROQ_API_KEY=${CONFIG.GROQ_API_KEY}
GEMINI_API_KEY=${CONFIG.GEMINI_API_KEY}

GROQ_MODEL=${CONFIG.GROQ_MODEL}
GROQ_FAST_MODEL=${CONFIG.GROQ_FAST_MODEL}
`;
  try {
    fs.writeFileSync(rootEnvPath, envContent, "utf-8");
  } catch (err) {
    console.warn("Could not persist .env file:", err);
  }

  return CONFIG;
}
