# Super quick PDF-AI parsing server in TS

## TLDR

Minimalistic (for example only - not production use) demonstration of how to use Langchain/OpenAI API for a PDF server in JS & TS

* `embed.ts` contains the logic for parsing, embedding, and saving a PDF document as a local vector store using FAISS
* `query.ts` handles incoming query requests and returns a response using GPT3.5 and the previously saved DB info
* `/embeddings/` directory is the local directory for where our vector embeddings are saved.
* `CustomChain.ts` is a custom Langchain Chain that is resposible for document retrieval, context addition, as well as the actual prompt for querying the Assistant once we retrieve the relevant information from the db.

## Server

This repo uses a minimal fastify server to just demonstrate an API route for parsing, saving, and querying PDF documents with Langchain + GPT3.5

Compile the typescript and run the `server.js` file or run it with `ts-node`. It will run on localhost 3000.

