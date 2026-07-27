import "dotenv/config";
import { ChatGroq } from "@langchain/groq";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
});

const response = await llm.invoke("Say hello in one sentence.");
console.log(response.content);