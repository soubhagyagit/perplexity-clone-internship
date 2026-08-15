import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnableMap, RunnableLambda } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { fastLlm } from "../config/models.js";
import { NexusSearchClient } from "../core/searchClient.js";
import { imageRephrasePrompt } from "../core/prompts.js";
import { formatChatHistory } from "../core/utils.js";

export interface ImageResult {
  img_src: string;
  thumbnail: string;
  url: string;
  title: string;
  score?: number;
}

function sanitizeQuery(raw: string): string {
  if (!raw) return "";
  const lines = raw.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const first = lines[0] || "";
  return first
    .replace(/^["'`]|["'`]$/g, "")
    .replace(/^(image query|query|standalone image query):\s*/i, "")
    .replace(/^[\d\.\-\*]+\s*/, "")
    .trim();
}

export function createImageSearchChain() {
  const searchClient = new NexusSearchClient();

  return RunnableSequence.from([
    RunnableMap.from({
      chat_history: (input: any) => formatChatHistory(input.chat_history),
      query: (input: any) => input.query,
    }),
    PromptTemplate.fromTemplate(imageRephrasePrompt),
    fastLlm,
    new StringOutputParser(),
    RunnableLambda.from(async (rephrasedQuery: string) => {
      const clean = sanitizeQuery(rephrasedQuery);
      const res = await searchClient.search(clean, {
        categories: ["images"],
        engines: ["bing images", "google images"],
        maxLimit: 20,
      });

      const results = res.results || [];
      const images: ImageResult[] = [];

      for (const r of results) {
        const imgSrc = r.img_src || r.thumbnail;
        const url = r.url || imgSrc;
        const title = r.title || "Visual Asset";

        if (imgSrc) {
          images.push({
            img_src: imgSrc,
            thumbnail: r.thumbnail || imgSrc || "",
            url: url || imgSrc || "",
            title: title || "Visual Asset",
            score: r.score,
          });
        }
      }

      return images.slice(0, 16);
    }),
  ]);
}

export async function executeImageAgent(query: string, chatHistory: any[] = []): Promise<ImageResult[]> {
  try {
    const chain = createImageSearchChain();
    return await chain.invoke({ query, chat_history: chatHistory });
  } catch (err) {
    const searchClient = new NexusSearchClient();
    const clean = sanitizeQuery(query);
    const res = await searchClient.search(clean, {
      categories: ["images"],
      engines: ["bing images", "google images"],
      maxLimit: 20,
    });

    return (res.results || []).map((r) => {
      const imgSrc = r.img_src || r.thumbnail || "";
      return {
        img_src: imgSrc,
        thumbnail: r.thumbnail || imgSrc || "",
        url: r.url || imgSrc || "",
        title: r.title || "Visual Asset",
        score: r.score,
      };
    }).filter((img) => Boolean(img.img_src)).slice(0, 16);
  }
}
