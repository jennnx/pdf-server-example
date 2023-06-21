import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
// import { customLoadQAWithSourcesChain } from './CustomLoadQAWithSourcesChain';
import { RetrievalQAChain } from "langchain/chains";
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export const embed = async (pdf: Blob, id: string) => {
    const loader = new PDFLoader(pdf);

    const docs = await loader.loadAndSplit(
        new RecursiveCharacterTextSplitter({ chunkSize: 600, chunkOverlap: 50 })
    );

    const vectorStore = await FaissStore.fromDocuments(
        docs,
        new OpenAIEmbeddings()
    );

    await vectorStore.save('./embeddings/' + id);

    console.log("All Done");
}