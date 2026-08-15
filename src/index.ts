import readline from "readline";
import { EventEmitter } from "events";
import {
  AGENT_REGISTRY,
  AgentMode,
  dispatchStreamingAgent,
  dispatchListAgent,
  executeSuggestionAgent,
} from "./agents/index.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

function handleCliStream(emitter: EventEmitter): Promise<void> {
  return new Promise((resolve) => {
    let headerPrinted = false;

    emitter.on("data", (dataStr: string) => {
      try {
        const payload = JSON.parse(dataStr);
        if (payload.type === "sources") {
          console.log("\n\x1b[36m╭──────────────────────────────────────────────╮\x1b[0m");
          console.log("\x1b[36m│          RETRIEVED & RERANKED SOURCES        │\x1b[0m");
          console.log("\x1b[36m╰──────────────────────────────────────────────╯\x1b[0m");
          payload.data.forEach((src: any) => {
            const scorePct = (src.relevanceScore * 100).toFixed(0);
            console.log(`\x1b[33m[${src.index}]\x1b[0m \x1b[1m${src.title}\x1b[0m (\x1b[32m${scorePct}% match\x1b[0m)`);
            console.log(`    \x1b[90m${src.url}\x1b[0m`);
          });
          console.log("");
        } else if (payload.type === "response") {
          if (!headerPrinted) {
            console.log("\x1b[32m╭──────────────────────────────────────────────╮\x1b[0m");
            console.log("\x1b[32m│            NEXUS SYNTHESIS STREAM            │\x1b[0m");
            console.log("\x1b[32m╰──────────────────────────────────────────────╯\x1b[0m\n");
            headerPrinted = true;
          }
          process.stdout.write(payload.data);
        }
      } catch {
        process.stdout.write(dataStr);
      }
    });

    emitter.on("end", () => {
      console.log("\n\n\x1b[90m─── [Stream Finished] ───\x1b[0m\n");
      resolve();
    });

    emitter.on("error", (err: any) => {
      console.error(`\n\x1b[31m[Agent Error]:\x1b[0m ${err}\n`);
      resolve();
    });
  });
}

async function main() {
  const chatHistory: any[] = [];

  console.clear();
  console.log("\x1b[38;2;16;185;129m");
  console.log("███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗ █████╗ ██╗");
  console.log("████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝██╔══██╗██║");
  console.log("██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗███████║██║");
  console.log("██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║██╔══██║██║");
  console.log("██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║██║  ██║██║");
  console.log("╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝");
  console.log("\x1b[0m");
  console.log("\x1b[1m  Hyper-Agentic Search & Deep Research CLI Engine\x1b[0m");
  console.log("\x1b[90m  LangChain LCEL • Cosine Vector Reranking • 8 Specialized Agents\x1b[0m\n");

  while (true) {
    console.log("\x1b[34m==============================================================\x1b[0m");
    console.log("\x1b[1mSELECT AGENT MODE:\x1b[0m");
    console.log("  [1] Web Intelligence Agent     (Multi-Engine RAG & Cited Synthesis)");
    console.log("  [2] Academic Research Agent    (ArXiv, Scholar, PubMed Synthesis)");
    console.log("  [3] Community & Reddit Agent   (Discussions & Sentiment Analysis)");
    console.log("  [4] YouTube Insights Agent     (Video Breakdowns & Timestamps)");
    console.log("  [5] Visual Discovery Agent     (Image Asset Cards & Gallery)");
    console.log("  [6] Video Stream Agent         (Video Streams & Embed Links)");
    console.log("  [7] Writing & Code Studio      (Zero-Search Direct LLM Drafting)");
    console.log("  [8] Cognitive Suggestions      (Follow-Up Generation at Temp=0)");
    console.log("  [9] Exit CLI");
    console.log("\x1b[34m==============================================================\x1b[0m");

    const choiceStr = await askQuestion("\x1b[1mEnter choice (1-9): \x1b[0m");
    const choice = parseInt(choiceStr.trim(), 10);

    if (isNaN(choice) || choice < 1 || choice > 9) {
      console.log("\x1b[31mInvalid option. Please enter a number from 1 to 9.\x1b[0m\n");
      continue;
    }

    if (choice === 9) {
      console.log("\n\x1b[32mExiting NexusAI. Have a productive day!\x1b[0m\n");
      rl.close();
      process.exit(0);
    }

    if (choice === 8) {
      console.log("\n\x1b[33mGenerating cognitive follow-up questions from conversation history...\x1b[0m");
      const suggestions = await executeSuggestionAgent(chatHistory);
      console.log("\n\x1b[36mSuggested Follow-ups:\x1b[0m");
      suggestions.forEach((s, idx) => console.log(`  ${idx + 1}. \x1b[1m${s}\x1b[0m`));
      console.log("");
      continue;
    }

    const query = await askQuestion("\n\x1b[1mEnter query: \x1b[0m");
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      continue;
    }

    console.log(`\n\x1b[90m[Nexus Pipeline Initiated] Query: "${trimmedQuery}"\x1b[0m\n`);

    const agentMap: Record<number, AgentMode> = {
      1: "web",
      2: "academic",
      3: "reddit",
      4: "youtube",
      5: "image",
      6: "video",
      7: "writing",
    };

    const mode = agentMap[choice];

    if (["web", "academic", "reddit", "youtube", "writing"].includes(mode)) {
      const emitter = dispatchStreamingAgent(mode, trimmedQuery, chatHistory);
      await handleCliStream(emitter);
      chatHistory.push({ role: "user", content: trimmedQuery });
    } else if (mode === "image" || mode === "video") {
      const results = await dispatchListAgent(mode, trimmedQuery, chatHistory);
      console.log("\n\x1b[36m╭──────────────────────────────────────────────╮\x1b[0m");
      console.log(`\x1b[36m│          ${mode.toUpperCase()} DISCOVERY RESULTS (${results.length})        │\x1b[0m`);
      console.log("\x1b[36m╰──────────────────────────────────────────────╯\x1b[0m\n");
      console.log(JSON.stringify(results, null, 2));
      console.log("");
      chatHistory.push({ role: "user", content: trimmedQuery });
    }
  }
}

main().catch((err) => {
  console.error("Fatal CLI Error:", err);
  rl.close();
});
