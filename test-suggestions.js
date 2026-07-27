import "dotenv/config";
import { ChatGroq } from "@langchain/groq";

import { generateSuggestions }
from "./src/agents/suggestionGeneratorAgent.js";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
});

const suggestions = await generateSuggestions(
  "What is AI?",
  "AI is the simulation of human intelligence by machines.",
  llm
);

console.log(suggestions);