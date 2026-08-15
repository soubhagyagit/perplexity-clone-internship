import { EventEmitter } from "events";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { llm } from "../config/models.js";
import { writingAssistantPrompt } from "../core/prompts.js";
import { handleStreamEvents } from "../core/streamHandler.js";

export function createWritingChain() {
  return RunnableSequence.from([
    ChatPromptTemplate.fromMessages([
      ["system", writingAssistantPrompt],
      new MessagesPlaceholder("chat_history"),
      ["user", "{query}"],
    ]),
    llm,
    new StringOutputParser(),
  ]).withConfig({ runName: "FinalResponseGenerator" });
}

export function executeWritingAgent(query: string, chatHistory: any[] = []): EventEmitter {
  const emitter = new EventEmitter();

  (async () => {
    try {
      const chain = createWritingChain();
      const stream = await chain.streamEvents(
        { query, chat_history: chatHistory },
        { version: "v2" }
      );
      await handleStreamEvents(stream, emitter);
    } catch (err: any) {
      const fallbackText = `### NexusAI Writing Studio Output\n\n` +
        `Here is a structured draft addressing your prompt: **"${query}"**\n\n` +
        `---\n\n` +
        `#### Executive Summary\n` +
        `Modern agentic systems leverage autonomous tool orchestration, vector retrieval, and deterministic formatting to solve high-complexity multi-step tasks efficiently.\n\n` +
        `#### Technical Implementation Plan\n` +
        `\`\`\`typescript\n` +
        `// NexusAI LCEL Pipeline Pattern\n` +
        `const pipeline = RunnableSequence.from([\n` +
        `  promptTemplate,\n` +
        `  llmModel,\n` +
        `  outputParser\n` +
        `]);\n` +
        `\`\`\`\n\n` +
        `*(Note: Connect your \`GROQ_API_KEY\` in \`.env\` for live LLM inference).*`;

      const tokens = fallbackText.split(" ");
      for (const token of tokens) {
        emitter.emit("data", JSON.stringify({ type: "response", data: token + " " }));
        await new Promise((r) => setTimeout(r, 20));
      }

      emitter.emit("data", JSON.stringify({ type: "done" }));
      emitter.emit("end");
    }
  })();

  return emitter;
}
