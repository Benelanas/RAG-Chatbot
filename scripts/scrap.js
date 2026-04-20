import puppeteer from "puppeteer";
import { splitIntoChunks } from "../lib/chunk.js";
import { embedTexts } from "../lib/embeddings.js";
import { qdrant, ensureCollection, QDRANT_COLLECTION } from "../lib/qdrant.js";
import fs from "fs";
import crypto from "crypto";


const data = [
  "https://fr.wikipedia.org/wiki/Formule_1"
];

async function scrapePage(url) {
  console.log(`🌐 Starting to scrape: ${url}`);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const content = await page.evaluate(() => document.body.innerText);

  await browser.close();
  console.log(`✅ Scraped content length: ${content.length}`);
  return content;
}

async function run() {
  const allChunks = [];
  
  for (const url of data) {
    console.log(`📄 Processing URL: ${url}`);
    const content = await scrapePage(url);
    const chunks = await splitIntoChunks(content);
    
    chunks.forEach((chunkText, idx) => {
      const id = crypto.createHash("sha1").update(`${url}:${idx}`).digest("hex");
      allChunks.push({
        id,
        docId: url,
        source: url,
        text: chunkText,
        chunkIndex: idx
      });
    });
    
    console.log(`📝 Created ${chunks.length} chunks from ${url}`);
  }
  
  console.log(`🤖 Generating embeddings for ${allChunks.length} total chunks...`);
  const embeddings = await embedTexts(allChunks.map(c => c.text));
  
  console.log(`✅ Generated ${embeddings.length} embeddings total`);
  console.log(`📊 Processed ${data.length} websites`);
  
  const index = {
    version: 1,
    createdAt: new Date().toISOString(),
    dims:1536,
    chunks: allChunks.map((chunk, i) => ({
      ...chunk,
      embedding: embeddings[i]
    }))
  };
  
  // Upsert into Qdrant
  console.log("📦 Ensuring Qdrant collection exists...");
  await ensureCollection();
  const points = index.chunks.map((chunk, idx) => ({
    id: idx + 1, // Use integer IDs instead of hash strings
    vector: chunk.embedding,
    payload: {
      text: chunk.text,
      source: chunk.source,
      docId: chunk.docId,
      chunkIndex: chunk.chunkIndex,
      originalId: chunk.id // Keep original hash as metadata
    }
  }));
  for (let i = 0; i < points.length; i += 100) {
    const batch = points.slice(i, i + 100);
    await qdrant.upsert(QDRANT_COLLECTION, { points: batch });
    console.log(`   ↳ Upserted ${i + batch.length}/${points.length}`);
  }
  console.log("✅ Finished upserting to Qdrant");
  fs.writeFileSync("./data/index.json", JSON.stringify(index, null, 2));
  console.log("🎉 Successfully saved data!");
}

run();
