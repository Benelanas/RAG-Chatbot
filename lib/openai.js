import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

console.log("🔍 Loading OpenAI configuration...");
console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);


export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL;
export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL;
