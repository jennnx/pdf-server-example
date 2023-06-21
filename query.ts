import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { customLoadQAWithSourcesChain } from './CustomChain';
import { RetrievalQAChain } from "langchain/chains";
import { FaissStore } from "langchain/vectorstores/faiss";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

export const queryDb = async (id, query) => {
    const loadedVectorStore = await FaissStore.load(`./embeddings/${id}`, new OpenAIEmbeddings());
    const model = new ChatOpenAI({
        temperature: 0.5,
        modelName: "gpt-3.5-turbo"
    });
    
    // The actual agent chain
    const chain = new RetrievalQAChain({
        retriever: loadedVectorStore.asRetriever(),
        combineDocumentsChain: customLoadQAWithSourcesChain(model)
    });
    
    return await chain.call({
        query,
    })
}