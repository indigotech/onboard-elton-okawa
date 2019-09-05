import { GraphQLServer } from 'graphql-yoga';
import { createConnection } from 'typeorm';

import formatError from './formatError';
import Query from './resolvers/queries';
import Mutation from './resolvers/mutations';

export const startServer = async () => {
  try {
    const connection = await createConnection();
    console.log('Connected successfully');
    
    const server = new GraphQLServer({
      typeDefs: './src/schema.graphql',
      resolvers: {
        Query,
        Mutation,
      },
      context: ({ request, response }) => {
        return { request, response, db: connection };
      }
    });
    await server.start({ formatError });
    console.log(`Server is running on http://localhost:4000`);
  } catch(error) {
    console.log(error);
  }
}
