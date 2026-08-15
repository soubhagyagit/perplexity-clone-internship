import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnableMap } from "@langchain/core/runnables";

import { fastLlm } from "../config/models.js";
import { suggestionGeneratorPrompt } from "../core/prompts.js";
import { formatChatHistory, ListLineOutputParser } from "../core/utils.js";

export function createSuggestionChain() {
  return RunnableSequence.from([
    RunnableMap.from({
      chat_history: (input: any) => formatChatHistory(input.chat_history),
    }),
    PromptTemplate.fromTemplate(suggestionGeneratorPrompt),
    fastLlm,
    new ListLineOutputParser({ tag: "suggestions" }),
  ]);
}

export async function executeSuggestionAgent(chatHistory: any[] = []): Promise<string[]> {
  if (!chatHistory || chatHistory.length === 0) {
    return [
      "What are the latest breakthroughs in agentic AI?",
      "How does vector reranking improve search accuracy?",
      "Can you compare LLM architectures for fast inference?",
      "Show me practical examples of LangChain LCEL pipelines",
    ];
  }

  try {
    const chain = createSuggestionChain();
    return await chain.invoke({ chat_history: chatHistory });
  } catch (err) {
    return [
      "Can you explain this in simpler terms?",
      "What are the primary advantages and disadvantages?",
      "Are there benchmark studies supporting these claims?",
      "What is the next step to implement this?",
    ];
  }
}
