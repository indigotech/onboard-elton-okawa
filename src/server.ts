import { GraphQLServer } from 'graphql-yoga';
import { createConnection } from 'typeorm';

import Query from './resolvers/Query';
import Mutation from './resolvers/Mutation';

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
      context: { db: connection }
    });
    await server.start();
    console.log(`Server is running on http://localhost:4000`);

  } catch(error) {
    console.log(error);
  }
}
