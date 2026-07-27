import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { handleWritingAssistant } from "./src/agents/writingAssistantAgent.js";
import readline from "readline";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const chatHistory = [];

const askQuestion = () => {
  rl.question("\nYou: ", async (userQuery) => {
    if (userQuery.toLowerCase() === "exit") {
      console.log("Goodbye!");
      rl.close();
      return;
    }

    const emitter = await handleWritingAssistant(
      userQuery,
      chatHistory,
      llm
    );

    process.stdout.write("\nAI: ");

    let aiResponse = "";

    emitter.on("data", (data) => {
      aiResponse += data;
      process.stdout.write(data);
    });

    emitter.on("end", () => {
      chatHistory.push({
        role: "user",
        content: userQuery,
      });

      chatHistory.push({
        role: "assistant",
        content: aiResponse,
      });

      askQuestion();
    });

    emitter.on("error", (error) => {
      console.error(error);
      askQuestion();
    });
  });
};

console.log("AI Writing Assistant Started");
console.log("Type 'exit' to quit.");

askQuestion();