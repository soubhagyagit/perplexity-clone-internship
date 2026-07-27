import "dotenv/config";
import { tavily } from "@tavily/core";

const client = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

const result = await client.search("What is LangChain?");

console.log(result);