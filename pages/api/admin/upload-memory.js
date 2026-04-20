import Busboy from "busboy";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import crypto from "crypto";
import { splitIntoChunks } from "../../../lib/chunk.js";
import { embedTexts } from "../../../lib/embeddings.js";
import { qdrant, ensureCollection, QDRANT_COLLECTION } from "../../../lib/qdrant.js";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  let fileName ="";
  let pdfBuffer = Buffer.alloc(0);
  const busboy = Busboy({ headers: req.headers });

  busboy.on("file", (_, file,filename) => {
     fileName = filename
    file.on("data", (chunk) => {
      pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
    });
  });

  busboy.on("finish", async () => {
    try {
      // Load PDF
      const pdfDoc = await pdfjsLib.getDocument(pdfBuffer).promise;

      let text = "";
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(" ") + "\n";
      }

      // Chunk text
      const chunks = await splitIntoChunks(text);

      // Convert chunks into objects
      const allChunks = chunks.map((chunk, idx) => ({
        id: crypto.randomUUID(),
        text: chunk,
        source: fileName,
        chunkIndex: idx,
      }));

      // Embeddings
      const embeddings = await embedTexts(allChunks.map((c) => c.text));

      // Ensure collection exists
      await ensureCollection();

      // Build points for Qdrant
      const points = allChunks.map((chunk, i) => ({
        id: chunk.id,
        vector: embeddings[i],
        payload: {
          text: chunk.text,
          source: chunk.source,
          chunkIndex: chunk.chunkIndex,
        },
      }));

      // Insert into Qdrant
      await qdrant.upsert(QDRANT_COLLECTION, { points });

      return res.status(200).json({
        message: "PDF processed and stored in vector DB",
        chunks: points.length,
      });

    } catch (error) {
      console.error("PDF error:", error);
      return res.status(500).json({ error: "Failed to parse PDF" });
    }
  });

  req.pipe(busboy);
}
