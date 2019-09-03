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
server.start(() => console.log(`Server is running on http://localhost:4000`))

createConnection().then(async connection => {
  console.log('Connected successfully');
}).catch(error => console.log(error));