// Require the framework and instantiate it
import Fastify from 'fastify'
import * as dotenv from 'dotenv';
import { embed } from './embed';
import { queryDb } from './query';
import cors from '@fastify/cors'

dotenv.config();

const fastify = Fastify({
  logger: true
})

fastify.register(cors, {
  origin: ['http://localhost:3000'] 
})

// Declare a route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

// Get Query
fastify.get('/query', async (request, reply) => {
  // get the `id` and `query` fields from the request. Then, call the `query` function with those fields and return the result
  const { id, query } = request.query as { id: string; query: string };

  const result = await queryDb(id, query);
  console.log(result.text);
  return reply.code(200).send(result);
})


fastify.post('/embed', async (request, reply) => {
  const { file, id } = request.body as { file: string; id: string };  
  const response = await fetch(file);
  const pdf = await response.blob();


  try {
    await embed(pdf, id);
    return reply.code(200).send({ success: true });
  } catch(e) {
    console.error(e);
    return reply.code(500).send({ success: false });
  }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 3030 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()