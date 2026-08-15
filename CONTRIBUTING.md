# Contributing to NexusAI

Thank you for your interest in contributing to **NexusAI**! We welcome contributions from developers, researchers, and AI enthusiasts.

---

## 🛠️ Development Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nexus-agentic-search.git
   cd nexus-agentic-search
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Copy `.env.example` to `.env` and configure your API keys:
   ```env
   GROQ_API_KEY=your_groq_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev:server
   ```

5. **Run Type Checks and Tests**:
   ```bash
   npm run build
   npm test
   ```

---

## 📐 Coding Standards & Guidelines

- **TypeScript Strictness**: Ensure all new files conform to strict TypeScript typing (`noImplicitAny`, proper return types).
- **LangChain LCEL Conventions**: Build modular agents using `RunnableSequence`, `RunnableMap`, and `RunnableLambda`.
- **UI Design System**: Preserve the Obsidian & Emerald luxury command-center aesthetic. Use CSS variables defined in `public/styles.css`.
- **Commit Messages**: Write concise, conventional commit messages (e.g. `feat: add hybrid dense-sparse vector reranker`, `fix: resolve sse stream termination`).

---

## 🔀 Pull Request Process

1. Create a descriptive feature branch (`git checkout -b feature/awesome-agent`).
2. Implement your changes with test coverage.
3. Ensure `npm run build` exits with code 0.
4. Push to your fork and submit a Pull Request against the `main` branch.
