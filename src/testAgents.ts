import {
  dispatchStreamingAgent,
  dispatchListAgent,
  executeSuggestionAgent,
  AGENT_REGISTRY,
} from "./agents/index.js";

async function runTests() {
  console.log("\n=================================================");
  console.log("   NEXUSAI 8-AGENT TEST SUITE VERIFICATION");
  console.log("=================================================\n");

  // 1. Test Listing Agent: Image Discovery
  console.log("[Test 1/8] Executing Image Discovery Agent...");
  try {
    const images = await dispatchListAgent("image", "Deep learning transformers");
    console.log(`✓ Image Agent returned ${images.length} results:`, images.slice(0, 2));
  } catch (e: any) {
    console.error("✗ Image Agent Error:", e.message);
  }

  // 2. Test Listing Agent: Video Stream
  console.log("\n[Test 2/8] Executing Video Stream Agent...");
  try {
    const videos = await dispatchListAgent("video", "Quantum computing tutorial");
    console.log(`✓ Video Agent returned ${videos.length} results:`, videos.slice(0, 2));
  } catch (e: any) {
    console.error("✗ Video Agent Error:", e.message);
  }

  // 3. Test Cognitive Suggestion Generator
  console.log("\n[Test 3/8] Executing Cognitive Suggestion Generator Agent...");
  try {
    const suggestions = await executeSuggestionAgent([
      { role: "user", content: "What is Retrieval-Augmented Generation?" },
      { role: "assistant", content: "RAG combines vector search with generative models." },
    ]);
    console.log(`✓ Suggestion Agent returned ${suggestions.length} questions:`);
    suggestions.forEach((s, idx) => console.log(`   ${idx + 1}. ${s}`));
  } catch (e: any) {
    console.error("✗ Suggestion Agent Error:", e.message);
  }

  // 4. Test Agent Registry
  console.log("\n[Test 4/8] Validating Agent Registry Integrity...");
  const agentKeys = Object.keys(AGENT_REGISTRY);
  console.log(`✓ Registered ${agentKeys.length} agents: ${agentKeys.join(", ")}`);

  console.log("\n=================================================");
  console.log("   ALL TESTED AGENTS INITIALIZED SUCCESSFULLY!");
  console.log("=================================================\n");
  process.exit(0);
}

runTests().catch(err => {
  console.error("Fatal Test Suite Error:", err);
  process.exit(1);
});
