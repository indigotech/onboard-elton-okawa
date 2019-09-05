import 'reflect-metadata';
import { GraphQLServer } from 'graphql-yoga';
import { createConnection, Connection } from 'typeorm';
import { User } from './entity/User';

const typeDefs = `
type Query {
  Hello(name: String): String!
}
`

const resolvers = {
  Query: {
    Hello: (_, { name }) => name ? `Hello, ${name}!` : 'Hello, world!'
  }
}

const server = new GraphQLServer({
  typeDefs,
  resolvers,
})

createConnection().then(async connection => {
  console.info('Connected successfully to database');
  server.start(() => console.info(`Server is running on http://localhost:4000`))
}).catch(error => console.error(error));