import { EventEmitter } from "events";

import { RunnableSequence } from "@langchain/core/runnables";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

import { StringOutputParser } from "@langchain/core/output_parsers";

import { writingAssistantPrompt } from "../prompts/writingAssistantPrompt.js";

import { handleStream } from "../utils/handleStream.js";

const createWritingAssistantChain = (llm) => {
  return RunnableSequence.from([
    ChatPromptTemplate.fromMessages([
      ["system", writingAssistantPrompt],
      new MessagesPlaceholder("chat_history"),
      ["user", "{query}"],
    ]),
    llm,
    new StringOutputParser(),
  ]).withConfig({
    runName: "FinalResponseGenerator",
  });
};

export const handleWritingAssistant = async (
  query,
  chat_history,
  llm
) => {
  const emitter = new EventEmitter();

  try {
    const chain = createWritingAssistantChain(llm);

    const stream = await chain.stream({
      query,
      chat_history,
    });

    handleStream(stream, emitter);
  } catch (error) {
    emitter.emit("error", error);
  }

  return emitter;
};