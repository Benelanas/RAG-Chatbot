import { openai, CHAT_MODEL } from "../../../lib/openai.js";
import { retrieve } from "../../../lib/retriever.js";

export default async function handler(req, res) {
  if (req.method !== "POST") 
    return res.status(405).json({ error: "Method not allowed" });

  if (!process.env.OPENAI_API_KEY) 
    return res.status(500).json({ error: "API key not configured" });

  try {
    const { content } = req.body;

    console.log("🔍 Retrieving relevant context for query:", content);

    // Retrieve relevant chunks from local data
    const relevantChunks = await retrieve(content, 3);
    
    if (relevantChunks.length === 0) {
      return res.status(500).json({ error: "No relevant data found in local database" });
    }

    console.log(`📚 Found ${relevantChunks.length} relevant chunks`);

    // Create context from retrieved chunks
    const context = relevantChunks.map(chunk => chunk.text).join("\n\n");
    
    // Create system message with context
    const systemMessage = `You are a helpful AI assistant. 
    Use the following context when it is relevant to answer the user's question:
    
    ${context}
    
    If the information is not in the context, simply say you do not have enough information to answer.
    Never answer outside the context knowledge.unless the user is just sayin hi or something doesn't need knowledge.
    Do not mention the context itself. 
    If you use details from the context, cite them clearly as "Source: ..."`;
    

    console.log("🤖 Sending to OpenAI with context...");

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const reply = completion.choices[0].message.content;
    
    console.log("✅ Response generated successfully");
    
    res.status(200).json({ 
      reply: reply,
      context: relevantChunks.map(chunk => ({
        text: chunk.text.substring(0, 200) + "...",
        source: chunk.source
      }))
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error.message
    });
  }
}
