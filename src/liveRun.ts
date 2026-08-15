import {
  dispatchStreamingAgent,
  dispatchListAgent,
  executeSuggestionAgent,
} from "./agents/index.js";

async function runLiveDemo() {
  console.log("\n======================================================");
  console.log("  🚀 NEXUSAI LIVE MULTI-AGENT EXECUTION DEMO");
  console.log("======================================================\n");

  // 1. Live Web Search & Answer Agent
  console.log("\x1b[36m[AGENT 1/3] Executing Web Intelligence Agent (Live Stream)...\x1b[0m");
  console.log("Query: \"What are the core architectural advantages of LangChain LCEL?\"\n");

  const emitter = dispatchStreamingAgent("web", "What are the core architectural advantages of LangChain LCEL?");

  await new Promise<void>((resolve) => {
    let headerShown = false;

    emitter.on("data", (chunkStr: string) => {
      try {
        const payload = JSON.parse(chunkStr);
        if (payload.type === "sources") {
          console.log("\x1b[33m╭──────────────────────────────────────────────────╮\x1b[0m");
          console.log("\x1b[33m│            SOURCES RETRIEVED & RERANKED          │\x1b[0m");
          console.log("\x1b[33m╰──────────────────────────────────────────────────╯\x1b[0m");
          payload.data.forEach((s: any) => {
            const matchScore = Math.round((s.relevanceScore || 0.9) * 100);
            console.log(`  \x1b[32m[${s.index}]\x1b[0m \x1b[1m${s.title}\x1b[0m (\x1b[36m${matchScore}% match\x1b[0m)`);
            console.log(`      \x1b[90m${s.url}\x1b[0m`);
          });
          console.log("");
        } else if (payload.type === "response") {
          if (!headerShown) {
            console.log("\x1b[32m╭──────────────────────────────────────────────────╮\x1b[0m");
            console.log("\x1b[32m│              SYNTHESIS STREAM OUTPUT             │\x1b[0m");
            console.log("\x1b[32m╰──────────────────────────────────────────────────╯\x1b[0m\n");
            headerShown = true;
          }
          process.stdout.write(payload.data);
        } else if (payload.type === "done" || payload.type === "end") {
          resolve();
        }
      } catch {
        process.stdout.write(chunkStr);
      }
    });

    emitter.on("end", () => resolve());
    emitter.on("error", (err) => {
      console.error("\x1b[31m[Agent Error]:\x1b[0m", err);
      resolve();
    });
  });

  // 2. Visual Discovery Agent
  console.log("\n\n\x1b[36m[AGENT 2/3] Executing Visual Discovery Agent (Images)...\x1b[0m");
  console.log("Query: \"Transformer Neural Network Attention Architecture\"\n");

  const images = (await dispatchListAgent("image", "Transformer Neural Network Attention Architecture")) as any[];
  console.log(`\x1b[32m✓ Retrieved ${images.length} High-Resolution Visual Assets:\x1b[0m`);
  images.slice(0, 2).forEach((img, i) => {
    console.log(`  \x1b[33m[Image ${i + 1}]\x1b[0m \x1b[1m${img.title}\x1b[0m`);
    console.log(`             \x1b[90mSource URL: ${img.url}\x1b[0m`);
    console.log(`             \x1b[90mThumbnail: ${img.thumbnail}\x1b[0m`);
  });

  // 3. Cognitive Suggestion Generator Agent
  console.log("\n\x1b[36m[AGENT 3/3] Executing Cognitive Suggestion Generator Agent...\x1b[0m");
  const suggestions = await executeSuggestionAgent([
    { role: "user", content: "What are the core architectural advantages of LangChain LCEL?" },
    { role: "assistant", content: "LCEL offers streaming, async support, and declarative runnables." },
  ]);

  console.log("\x1b[32m✓ Generated Real-Time Contextual Follow-up Chips:\x1b[0m");
  suggestions.forEach((q, idx) => {
    console.log(`  \x1b[35m(${idx + 1})\x1b[0m \x1b[1m${q}\x1b[0m`);
  });

  console.log("\n======================================================");
  console.log("  ✨ LIVE MULTI-AGENT EXECUTION COMPLETED!");
  console.log("======================================================\n");
  process.exit(0);
}

runLiveDemo().catch((err) => {
  console.error("Live demo failed:", err);
  process.exit(1);
});
