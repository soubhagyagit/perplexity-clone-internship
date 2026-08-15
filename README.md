# 🌐 NexusAI — Hyper-Agentic Search & Deep Research Engine

**NexusAI** is a multi-agent AI search and synthesis platform built with **TypeScript**, **LangChain Expression Language (LCEL)**, and **Vector Cosine Similarity Reranking**.

Inspired by Perplexity AI, NexusAI features **8 distinct specialized agents**, real-time Server-Sent Events (SSE) streaming, precision source citations (`[1]`, `[2]`), and a **Command-Center UI** with an interactive **Real-Time Agent Execution Telemetry Drawer**.

---

## 🚀 Key Features

- **8 Specialized Agents**:
  - **Group A (Search & Answer)**:
    1. 🌐 **Web Intelligence Agent**: Multi-engine retrieval with vector reranking and factual cited answers.
    2. 🎓 **Academic Research Agent**: Literature synthesis targeting ArXiv, Google Scholar, PubMed, and scholarly databases.
    3. 👥 **Reddit & Community Agent**: Discussion sentiment analysis, crowd consensus, and contrasting viewpoints.
    4. 📺 **YouTube Insights Agent**: Video tutorial breakdowns, lecture timestamps, and channel discoveries.
  - **Group B (Search & List)**:
    5. 🖼️ **Visual Discovery Agent**: High-resolution image card extraction with fullscreen zoom lightbox.
    6. 🎬 **Video Stream Agent**: Playable video cards with responsive inline player modals.
  - **Group C (Specialized Intelligence & Utilities)**:
    7. ✍️ **Writing Studio Agent**: Zero-search generative drafting, code architecture, and formatting assistant.
    8. 💡 **Cognitive Suggestion Generator**: Follow-up query engine running at `temperature = 0` for diversity.

- **Real-Time Pipeline Telemetry**:
  - Watch the multi-agent thought pipeline execute step-by-step:
    1. **Query Rephrasing** $\to$ Standalone search query formulation.
    2. **Multi-Engine Retrieval** $\to$ Engines queried & raw hits.
    3. **Cosine Vector Reranking** $\to$ Semantic similarity scoring matrix.
    4. **Context & Cited Synthesis** $\to$ Streaming markdown with hoverable citation tooltips.

- **Resilient Multi-Engine Backend**:
  - Integrates natively with [SearXNG](https://docs.searxng.org/).
  - Includes an intelligent automatic fallback search provider so the entire application runs seamlessly even if SearXNG is offline.

- **Dual Interfaces**:
  - **Interactive Terminal CLI** with ANSI styling (`npm start`).
  - **Express SSE Web Server & UI** (`npm run dev:server`).
  - **FastAPI Alternative Gateway** (`npm run dev:py`).

---

## 🛠️ Tech Stack & Architecture

- **Runtime & Language**: Node.js (ESM), TypeScript 5.7+
- **Agent Framework**: LangChain LCEL (`RunnableSequence`, `RunnableMap`, `RunnableLambda`, `ChatPromptTemplate`, `StringOutputParser`)
- **LLMs & Embeddings**: Groq (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`), Google Generative AI (`text-embedding-004`)
- **Vector Reranker**: Custom mathematical Cosine Similarity engine ($\vec{u} \cdot \vec{v} / \|\vec{u}\|\|\vec{v}\|$)
- **Frontend**: Vanilla HTML5/CSS3/JavaScript (Obsidian & Emerald Design System, Marked.js, Highlight.js)

---

## 📦 Quick Start & Installation

### 1. Clone & Install Dependencies

```bash
cd nexus-agentic-search
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
PORT=3000
SEARXNG_URL=http://localhost:8888
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

*(Note: If API keys are not provided yet, the application gracefully initializes with local offline vectors and fallback context for testing).*

---

## 🖥️ Running the Application

### Option A: Modern Web UI & API Server (Recommended)
```bash
npm run dev:server
```
Open **`http://localhost:3000`** in your browser.

### Option B: Interactive Terminal CLI
```bash
npm start
```

### Option C: FastAPI Alternative Backend
```bash
npm run dev:py
```

---

## 📡 API Endpoints

### 1. Streaming Search & Answer
`GET /api/search/stream?mode={mode}&query={query}&history={json_history}`
- **Modes**: `web`, `academic`, `reddit`, `youtube`, `writing`
- **Output**: `text/event-stream` SSE chunks (`sources`, `response`, `done`)

### 2. Media & Utility Search
`GET /api/search/list?mode={mode}&query={query}&history={json_history}`
- **Modes**: `image`, `video`, `suggestion`
- **Output**: `application/json`

### 3. System Diagnostics
`GET /api/health`
- **Output**: Engine health, SearXNG connection status, and model states.

---

## 📄 License
MIT License. Built for advanced agentic search research and development.
