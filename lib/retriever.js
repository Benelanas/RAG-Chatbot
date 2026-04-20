import { embedTexts } from "./embeddings.js";
import { qdrant, QDRANT_COLLECTION } from "./qdrant.js";

export async function retrieve(query, k = 5) {
  try {
    const [queryEmbedding] = await embedTexts([query]);

    const results = await qdrant.search(QDRANT_COLLECTION, {
      vector: queryEmbedding,
      limit: k,
      with_payload: true,
      with_vector: false,
    });

    return results.map(r => ({
      id: r.id,
      score: r.score,
      text: r.payload?.text,
      source: r.payload?.source,
      docId: r.payload?.docId,
      chunkIndex: r.payload?.chunkIndex,
    }));
  } catch (error) {
    console.error("Retrieval error:", error);
    throw error;
  }
}