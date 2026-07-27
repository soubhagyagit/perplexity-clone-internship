import "dotenv/config";
import express from "express";
import cors from "cors";
import { ChatGroq } from "@langchain/groq";
import { generateSuggestions } from "./src/agents/suggestionGeneratorAgent.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
  temperature: 0.3,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required.",
      });
    }

    const response = await llm.invoke(`
You are Perplexity AI.

Answer the following question clearly and concisely.

Question:
${prompt}

Keep the answer under 150 words unless the user asks for more details.
`);

    // ✅ Pass all required arguments
    const suggestions = await generateSuggestions(
      prompt,
      response.content,
      llm
    );

    res.json({
      success: true,
      answer: response.content,
      suggestions,
    });

  } catch (error) {
    console.error("Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});