import { ChatGroq } from "@langchain/groq";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { CONFIG } from "./env.js";

// Factory function for active LLM
export function createLlm(modelName?: string, temperature: number = 0.2) {
  const apiKey = CONFIG.GROQ_API_KEY || process.env.GROQ_API_KEY || "dummy_key";
  return new ChatGroq({
    apiKey,
    model: modelName || CONFIG.GROQ_MODEL || "llama-3.3-70b-versatile",
    temperature,
    streaming: true,
  });
}

// Factory function for fast deterministic LLM
export function createFastLlm(modelName?: string) {
  const apiKey = CONFIG.GROQ_API_KEY || process.env.GROQ_API_KEY || "dummy_key";
  return new ChatGroq({
    apiKey,
    model: modelName || CONFIG.GROQ_FAST_MODEL || "llama-3.1-8b-instant",
    temperature: 0.0,
  });
}

// Factory function for vector embeddings
export function createEmbeddings() {
  const apiKey = CONFIG.GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "dummy_key";
  return new GoogleGenerativeAIEmbeddings({
    apiKey,
    modelName: "text-embedding-004",
  });
}

export let llm = createLlm();
export let fastLlm = createFastLlm();
export let embeddings = createEmbeddings();

export function refreshModels() {
  llm = createLlm();
  fastLlm = createFastLlm();
  embeddings = createEmbeddings();
}
