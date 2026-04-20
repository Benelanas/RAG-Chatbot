import { openai, EMBEDDING_MODEL } from "./openai.js";

export async function embedTexts(texts) {
  const batchSize = 16; // Reduced from 64 to prevent token limit
  const maxTextLength = 8000; // Limit text length to stay under token limit
  const all = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    // Truncate texts that are too long
    const truncatedBatch = batch.map(text => 
      text.length > maxTextLength ? text.substring(0, maxTextLength) : text
    );
    
    const res = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: truncatedBatch,
    });
    
    for (const item of res.data) all.push(item.embedding);
  }
  
  return all;
}