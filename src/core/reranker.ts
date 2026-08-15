import { Document } from "@langchain/core/documents";

/**
 * Calculates mathematical Cosine Similarity between two numerical vectors.
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const dimension = Math.min(vecA.length, vecB.length);

  for (let i = 0; i < dimension; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

/**
 * Lightweight local TF-IDF style character n-gram vectorizer for offline resilience
 */
function localFeatureVector(text: string, vocab: string[]): number[] {
  const clean = text.toLowerCase();
  return vocab.map(word => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    const count = (clean.match(regex) || []).length;
    return count;
  });
}

function fallbackLocalRerank(query: string, docs: Document[]): Document[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (queryWords.length === 0) return docs.slice(0, 10);

  const queryVec = localFeatureVector(query, queryWords);
  const scored = docs.map(doc => {
    const docVec = localFeatureVector(doc.pageContent + " " + (doc.metadata?.title || ""), queryWords);
    const sim = calculateCosineSimilarity(queryVec, docVec);
    const baseScore = typeof doc.metadata?.score === "number" ? doc.metadata.score * 0.3 : 0.2;
    const finalScore = Math.min(0.99, Math.max(0.1, sim * 0.7 + baseScore));
    doc.metadata = { ...doc.metadata, relevanceScore: parseFloat(finalScore.toFixed(3)) };
    return { doc, score: finalScore };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.doc).slice(0, 10);
}

/**
 * Reranks retrieved LangChain documents against the user query using Vector Embeddings & Cosine Similarity
 */
export async function rerankDocuments(
  query: string,
  docs: Document[],
  embeddingsModel: any,
  similarityThreshold: number = 0.45
): Promise<Document[]> {
  if (!docs || docs.length === 0) return [];

  try {
    const queryVector = await embeddingsModel.embedQuery(query);
    const docTexts = docs.map((d) => `${d.metadata?.title || ""}\n${d.pageContent}`);
    const docVectors = await embeddingsModel.embedDocuments(docTexts);

    const scoredDocs = docs.map((doc, idx) => {
      const score = calculateCosineSimilarity(queryVector, docVectors[idx]);
      doc.metadata = {
        ...doc.metadata,
        relevanceScore: parseFloat(score.toFixed(3)),
      };
      return { doc, score };
    });

    // Sort descending by cosine similarity
    scoredDocs.sort((a, b) => b.score - a.score);

    // Filter by similarity threshold
    let filtered = scoredDocs.filter((item) => item.score >= similarityThreshold).map((item) => item.doc);

    // Fallback: If no documents pass strict threshold, keep top 5
    if (filtered.length === 0 && scoredDocs.length > 0) {
      filtered = scoredDocs.slice(0, 5).map((item) => item.doc);
    }

    return filtered.slice(0, 12);
  } catch (err) {
    // Gracefully degrade to local feature scoring if embeddings API fails
    return fallbackLocalRerank(query, docs);
  }
}
