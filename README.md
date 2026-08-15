# 🌐 NexusAI


NexusAI is an AI-based search application that uses different AI agents for different tasks.


It is built using **TypeScript, LangChain, SearXNG, and AI models**.


---


## 🚀 Features


NexusAI has 8 specialized agents:


1. 🌐 **Web Agent** - Searches the web for information.
2. 🎓 **Academic Agent** - Searches for research and academic information.
3. 👥 **Reddit Agent** - Finds opinions and discussions from Reddit.
4. 📺 **YouTube Agent** - Finds useful YouTube videos.
5. 🖼️ **Image Agent** - Searches for images.
6. 🎬 **Video Agent** - Finds videos that can be played in the app.
7. ✍️ **Writing Agent** - Helps with writing, coding, editing, and summaries.
8. 💡 **Suggestion Agent** - Generates follow-up questions.


---


## 🔄 How It Works


```text
User
  ↓
Select Agent
  ↓
Process Request
  ↓
Search / AI Processing
  ↓
Generate Result
  ↓
Show Result
🛠️ Technologies Used
TypeScript
Node.js
LangChain
SearXNG
HTML
CSS
JavaScript
Groq AI
Google Generative AI
📦 Installation
1. Clone the repository
git clone YOUR_GITHUB_REPOSITORY_LINK
2. Go to the project folder
cd nexus-agentic-search
3. Install dependencies
npm install
🔑 Environment Variables

Create a .env file in the project folder.

PORT=3000
SEARXNG_URL=http://localhost:8888
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

Add your own API keys.

Do not upload your .env file or API keys to GitHub.

▶️ Run the Project
Start Web Application
npm run dev:server

Then open:

http://localhost:3000
Start Terminal Version
npm start
📁 Project Agents
agents/
├── webAgent.ts
├── academicAgent.ts
├── redditAgent.ts
├── youtubeAgent.ts
├── imageAgent.ts
├── videoAgent.ts
├── writingAgent.ts
└── suggestionAgent.ts

Each agent is responsible for a different task.

🎯 Project Goal

The goal of NexusAI is to create one AI application that can handle different types of tasks using specialized agents.
