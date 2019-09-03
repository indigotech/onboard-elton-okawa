const { GraphQLServer } = require('graphql-yoga')

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
