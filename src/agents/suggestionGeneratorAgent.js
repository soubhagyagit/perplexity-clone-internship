import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

import { suggestionGeneratorPrompt }
from "../prompts/suggestionGeneratorPrompt.js";

export const generateSuggestions = async (
  query,
  answer,
  llm
) => {

  const chain = RunnableSequence.from([
    ChatPromptTemplate.fromMessages([
      ["system", suggestionGeneratorPrompt],
      [
        "human",
        `
Question:
{query}

Answer:
{answer}
        `,
      ],
    ]),
    llm,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({
    query,
    answer,
  });

  return result
    .split("\n")
    .filter((item) => item.trim());
};