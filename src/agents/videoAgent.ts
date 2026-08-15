import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnableMap, RunnableLambda } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { fastLlm } from "../config/models.js";
import { NexusSearchClient } from "../core/searchClient.js";
import { videoRephrasePrompt } from "../core/prompts.js";
import { formatChatHistory } from "../core/utils.js";

export interface VideoResult {
  img_src: string;
  thumbnail: string;
  url: string;
  title: string;
  iframe_src: string;
  score?: number;
}

function sanitizeQuery(raw: string): string {
  if (!raw) return "";
  const lines = raw.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const first = lines[0] || "";
  return first
    .replace(/^["'`]|["'`]$/g, "")
    .replace(/^(video query|query|standalone video query):\s*/i, "")
    .replace(/^[\d\.\-\*]+\s*/, "")
    .trim();
}

export function createVideoSearchChain() {
  const searchClient = new NexusSearchClient();

  return RunnableSequence.from([
    RunnableMap.from({
      chat_history: (input: any) => formatChatHistory(input.chat_history),
      query: (input: any) => input.query,
    }),
    PromptTemplate.fromTemplate(videoRephrasePrompt),
    fastLlm,
    new StringOutputParser(),
    RunnableLambda.from(async (rephrasedQuery: string) => {
      const clean = sanitizeQuery(rephrasedQuery);
      const res = await searchClient.search(clean, {
        engines: ["youtube"],
        maxLimit: 12,
      });

      const results = res.results || [];
      const videos: VideoResult[] = [];

      for (const r of results) {
        const imgSrc = r.thumbnail || r.img_src || "";
        const url = r.url || "";
        const title = r.title || "Video Stream";
        let iframeSrc = r.iframe_src || url;

        if (url.includes("youtube.com/watch?v=")) {
          const videoId = url.split("v=")[1]?.split("&")[0];
          if (videoId) {
            iframeSrc = `https://www.youtube.com/embed/${videoId}`;
          }
        } else if (url.includes("youtu.be/")) {
          const videoId = url.split("youtu.be/")[1]?.split("?")[0];
          if (videoId) {
            iframeSrc = `https://www.youtube.com/embed/${videoId}`;
          }
        }

        if (url && title) {
          videos.push({
            img_src: imgSrc,
            thumbnail: imgSrc,
            url: url,
            title: title,
            iframe_src: iframeSrc,
            score: r.score,
          });
        }
      }

      return videos.slice(0, 12);
    }),
  ]);
}

export async function executeVideoAgent(query: string, chatHistory: any[] = []): Promise<VideoResult[]> {
  try {
    const chain = createVideoSearchChain();
    return await chain.invoke({ query, chat_history: chatHistory });
  } catch (err) {
    const searchClient = new NexusSearchClient();
    const clean = sanitizeQuery(query);
    const res = await searchClient.search(clean, {
      engines: ["youtube"],
      maxLimit: 12,
    });

    return (res.results || []).map((r) => {
      const imgSrc = r.thumbnail || r.img_src || "";
      const url = r.url || "";
      let iframeSrc = r.iframe_src || url;

      if (url.includes("youtube.com/watch?v=")) {
        const videoId = url.split("v=")[1]?.split("&")[0];
        if (videoId) iframeSrc = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        if (videoId) iframeSrc = `https://www.youtube.com/embed/${videoId}`;
      }

      return {
        img_src: imgSrc,
        thumbnail: imgSrc,
        url,
        title: r.title || "Video Stream",
        iframe_src: iframeSrc,
        score: r.score,
      };
    }).filter((v) => Boolean(v.url)).slice(0, 12);
  }
}
