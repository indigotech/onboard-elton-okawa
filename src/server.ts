import { GraphQLServer } from 'graphql-yoga';
import { createConnection } from 'typeorm';
import { buildSchema } from 'type-graphql';

import { authChecker } from 'src/utils';
import formatError from 'src/formatError';
import Query from 'src/resolvers/queries';
import Mutation from 'src/resolvers/mutations';


export const startServer = async () => {
  try {
    const connection = await createConnection();
    console.info('Connected successfully');
    
    const schema = await buildSchema({
      resolvers: [ ...Query, ...Mutation ],
      authChecker,
      validate: false,
    });

    const server = new GraphQLServer({
      schema,
      context: ({ request, response }) => {
        return { request, response, db: connection };
      },
    });
    const httpServer = await server.start({ formatError });
    console.info(`Server is running on http://localhost:4000`);
    return httpServer;
  } catch(error) {
    console.error(error);
  }
}
