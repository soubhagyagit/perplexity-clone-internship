import { Document } from "@langchain/core/documents";
import { BaseOutputParser } from "@langchain/core/output_parsers";

/**
 * Formats multi-turn chat history into a structured string for prompt templates
 */
export function formatChatHistory(chatHistory: any[]): string {
  if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
    return "No previous conversation.";
  }

  return chatHistory
    .map((msg) => {
      if (typeof msg === "string") return msg;
      const role = (msg.role || msg.type || "user").toLowerCase();
      const prefix = role === "user" || role === "human" ? "User" : "Assistant";
      const content = msg.content || "";
      return `${prefix}: ${content}`;
    })
    .join("\n");
}

/**
 * Formats a list of Document objects into a clean, cited context string
 */
export function processDocs(docs: Document[]): string {
  if (!docs || docs.length === 0) {
    return "No external context sources retrieved.";
  }

  return docs
    .map((doc, idx) => {
      const index = idx + 1;
      const title = doc.metadata?.title || `Resource ${index}`;
      const url = doc.metadata?.url || "";
      const content = (doc.pageContent || "").trim();
      const score = doc.metadata?.relevanceScore ? ` (Relevance: ${(doc.metadata.relevanceScore * 100).toFixed(0)}%)` : "";
      return `[${index}] ${title}${score}\nSource URL: ${url}\nSummary: ${content}`;
    })
    .join("\n\n---\n\n");
}

/**
 * Custom LangChain Output Parser for XML-tagged suggestion blocks
 */
export class ListLineOutputParser extends BaseOutputParser<string[]> {
  lc_namespace = ["langchain", "output_parsers"];
  tag: string = "suggestions";

  constructor(fields?: { tag: string }) {
    super();
    if (fields?.tag) {
      this.tag = fields.tag;
    }
  }

  getFormatInstructions(): string {
    return `Output the suggestions wrapped inside <${this.tag}> and </${this.tag}> tags, one per line.`;
  }

  async parse(text: string): Promise<string[]> {
    const regex = new RegExp(`<${this.tag}>([\\s\\S]*?)<\\/${this.tag}>`, "i");
    const match = text.match(regex);

    let rawList: string[] = [];
    if (match && match[1]) {
      rawList = match[1].split("\n");
    } else {
      rawList = text.split("\n");
    }

    const cleaned = rawList
      .map((line) => line.replace(/^[\d\.\-\*\•\>\s]+/, "").trim())
      .filter((line) => line.length > 5 && !line.startsWith("<") && !line.endsWith(">"))
      .slice(0, 5);

    if (cleaned.length > 0) {
      return cleaned;
    }

    return [
      "Can you expand more on the architectural trade-offs?",
      "What are real-world performance benchmarks for this?",
      "How does this compare against alternative solutions?",
      "What are the best practices for production deployment?",
    ];
  }
}
