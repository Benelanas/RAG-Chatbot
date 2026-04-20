import { CharacterTextSplitter } from "langchain/text_splitter";

export async function splitIntoChunks(text) {
    const splitter = new CharacterTextSplitter({
        chunkSize: 512,
        chunkOverlap: 100,
        separator: "\n\n",
        keepSeparator: false,
    });
    
    return await splitter.splitText(text);
}