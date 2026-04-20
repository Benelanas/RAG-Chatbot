import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const qdrantUrl = process.env.QDRANT_URL;
const qdrantApiKey = process.env.QDRANT_API_KEY;

export const QDRANT_COLLECTION = "my-rag-collection";

// error checking
console.log("🔍 Qdrant configuration:");
console.log("  URL:", qdrantUrl);
console.log("  API Key exists:", !!qdrantApiKey);
console.log("  Collection:", QDRANT_COLLECTION);

export const qdrant = new QdrantClient({
  url: qdrantUrl,
  apiKey: qdrantApiKey,
  timeout: 30000, // 30 second timeout
});

export async function ensureCollection() {
  const collections = await qdrant.getCollections();
  const exists = collections.collections?.some(
    (c) => c.name === QDRANT_COLLECTION
  );
  if (exists) return; // collection already exists

  await qdrant.createCollection(QDRANT_COLLECTION, {
    vectors: {
      size: 1536, // dimension of the vectors
      distance: "Cosine",
    },
  });
}
