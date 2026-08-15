import { EventEmitter } from "events";
import { executeWebAgent } from "./webAgent.js";
import { executeAcademicAgent } from "./academicAgent.js";
import { executeRedditAgent } from "./redditAgent.js";
import { executeYouTubeAgent } from "./youtubeAgent.js";
import { executeImageAgent, ImageResult } from "./imageAgent.js";
import { executeVideoAgent, VideoResult } from "./videoAgent.js";
import { executeWritingAgent } from "./writingAgent.js";
import { executeSuggestionAgent } from "./suggestionAgent.js";

export {
  executeWebAgent,
  executeAcademicAgent,
  executeRedditAgent,
  executeYouTubeAgent,
  executeImageAgent,
  executeVideoAgent,
  executeWritingAgent,
  executeSuggestionAgent,
};

export type AgentMode =
  | "web"
  | "academic"
  | "reddit"
  | "youtube"
  | "image"
  | "video"
  | "writing"
  | "suggestion";

export interface AgentDescriptor {
  id: AgentMode;
  name: string;
  category: "Search & Answer" | "Search & List" | "Specialized Intelligence";
  description: string;
  icon: string;
  badge: string;
  streaming: boolean;
}

export const AGENT_REGISTRY: Record<AgentMode, AgentDescriptor> = {
  web: {
    id: "web",
    name: "Web Intelligence",
    category: "Search & Answer",
    description: "Multi-engine web search with vector reranking and factual cited synthesis.",
    icon: "globe",
    badge: "Live RAG",
    streaming: true,
  },
  academic: {
    id: "academic",
    name: "Academic Research",
    category: "Search & Answer",
    description: "Deep scholarly analysis synthesizing ArXiv, Google Scholar, PubMed, and literature.",
    icon: "graduation-cap",
    badge: "Peer-Reviewed",
    streaming: true,
  },
  reddit: {
    id: "reddit",
    name: "Community & Reddit",
    category: "Search & Answer",
    description: "Extracts crowd sentiment, real-world field experiences, and forum consensus.",
    icon: "users",
    badge: "Discussions",
    streaming: true,
  },
  youtube: {
    id: "youtube",
    name: "YouTube & Video Insights",
    category: "Search & Answer",
    description: "Synthesizes video tutorials, creator perspectives, lecture timestamps, and channels.",
    icon: "play-circle",
    badge: "Media RAG",
    streaming: true,
  },
  image: {
    id: "image",
    name: "Visual Discovery",
    category: "Search & List",
    description: "Fetches high-resolution images, metadata, and visual assets with instant lightbox.",
    icon: "image",
    badge: "Gallery",
    streaming: false,
  },
  video: {
    id: "video",
    name: "Video Streams",
    category: "Search & List",
    description: "Discovers playable video feeds with embed players and timestamps.",
    icon: "film",
    badge: "Player",
    streaming: false,
  },
  writing: {
    id: "writing",
    name: "Writing & Code Studio",
    category: "Specialized Intelligence",
    description: "Zero-search drafting, copy editing, code architecture, and structured formatting.",
    icon: "pen-tool",
    badge: "Creative",
    streaming: true,
  },
  suggestion: {
    id: "suggestion",
    name: "Cognitive Suggestions",
    category: "Specialized Intelligence",
    description: "Generates context-aware follow-up queries powered by zero-temperature LLM.",
    icon: "sparkles",
    badge: "Utility",
    streaming: false,
  },
};

/**
 * Dispatches streaming agents (Group A + Writing)
 */
export function dispatchStreamingAgent(
  mode: AgentMode,
  query: string,
  chatHistory: any[] = []
): EventEmitter {
  switch (mode) {
    case "academic":
      return executeAcademicAgent(query, chatHistory);
    case "reddit":
      return executeRedditAgent(query, chatHistory);
    case "youtube":
      return executeYouTubeAgent(query, chatHistory);
    case "writing":
      return executeWritingAgent(query, chatHistory);
    case "web":
    default:
      return executeWebAgent(query, chatHistory);
  }
}

/**
 * Dispatches listing & utility agents (Group B + Suggestion)
 */
export async function dispatchListAgent(
  mode: AgentMode,
  query: string,
  chatHistory: any[] = []
): Promise<ImageResult[] | VideoResult[] | string[]> {
  switch (mode) {
    case "image":
      return await executeImageAgent(query, chatHistory);
    case "video":
      return await executeVideoAgent(query, chatHistory);
    case "suggestion":
      return await executeSuggestionAgent(chatHistory);
    default:
      throw new Error(`Mode '${mode}' is not a listing agent.`);
  }
}
