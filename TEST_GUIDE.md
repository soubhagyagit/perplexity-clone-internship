# 🧪 NexusAI Verification & Test Guide

Use these test queries to verify the capabilities of each of the 8 agents in NexusAI.

---

## 1. Group A: Search & Answer Agents

### 🌐 1. Web Intelligence Agent
- **Test Prompt 1**: `"What are the key architectural improvements in LLaMA 3.3 compared to LLaMA 3.1?"`
- **Test Prompt 2**: `"Explain how modern vector databases use HNSW indexing vs Flat indexing with benchmarks."`
- **Expected Result**: Real-time streaming response with bracketed source citations `[1]`, `[2]` and verified source cards.

### 🎓 2. Academic Research Agent
- **Test Prompt 1**: `"Synthesize recent papers on Test-Time Compute scaling and Chain-of-Thought verification."`
- **Test Prompt 2**: `"What are the current peer-reviewed findings on LLM hallucination mitigation strategies?"`
- **Expected Result**: Formal scholarly synthesis citing ArXiv/Scholar paper titles, methodologies, and findings.

### 👥 3. Reddit & Community Agent
- **Test Prompt 1**: `"What is the real developer sentiment on migrating large Next.js apps to Vite React in 2025?"`
- **Test Prompt 2**: `"What are common gotchas when using LangChain in high-throughput production systems according to reddit?"`
- **Expected Result**: Clear categorization of Community Consensus, Pros & Cons, and contrarian perspectives.

### 📺 4. YouTube Insights Agent
- **Test Prompt 1**: `"What are the best video tutorials explaining LangChain LCEL architecture from scratch?"`
- **Test Prompt 2**: `"Summarize key video explanations on Transformer self-attention mechanisms."`
- **Expected Result**: Video recommendations, creator names, timestamps, and core visual takeaways.

---

## 2. Group B: Search & List Agents

### 🖼️ 5. Visual Discovery Agent (Images)
- **Test Prompt**: `"Quantum computing quantum circuit architecture diagrams"`
- **Expected Result**: Responsive image grid. Clicking any image opens the high-res zoom lightbox.

### 🎬 6. Video Stream Agent (Videos)
- **Test Prompt**: `"Building AI Agents with LangChain 2025 tutorial"`
- **Expected Result**: Video cards with thumbnails and play button. Clicking a card opens the responsive video player modal.

---

## 3. Group C: Specialized & Utilities

### ✍️ 7. Writing & Code Studio Agent
- **Test Prompt 1**: `"Refactor this JavaScript function into a clean TypeScript Generic with error types."`
- **Test Prompt 2**: `"Draft a professional executive summary for an enterprise Agentic AI migration proposal."`
- **Expected Result**: Fast, direct LLM generation formatted in Markdown without search overhead.

### 💡 8. Cognitive Suggestion Generator
- **Test Trigger**: Executed automatically after any conversation turn or via CLI option `[8]`.
- **Expected Result**: 4 to 5 contextual follow-up question chips ready to click and ask next.
