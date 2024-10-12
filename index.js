// 1. Require 'apollo-server'
const { ApolloServer } = require("apollo-server");

const typeDefs = `
    type Query {
        totalPhotos: Int!
    }

    # 1. Add Photo type definition
    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
    }

    # 2. Return Photo from allPhotos
    type Query {
        totalPhotos: Int!
        allPhotos: [Photo!]!
    }

    # 3. Return the newly posted photo from the mutation
    type Mutation {
        postPhoto(name: String! description: String): Photo!
    }
`;

let _id = 0;
let photos = [];

const resolvers = {
  Query: {
    totalPhotos: () => 42,
    allPhotos: () => photos,
  },
  // 3. Mutation and postPhoto resolver
  Mutation: {
    postPhoto(parent, args) {
      // Create a new photo, and generate an ID
      const newPhoto = {
        id: _id++,
        ...args,
      };
      photos.push(newPhoto);
      // Return the new photo
      return newPhoto;
    },
  },
  Photo: {
    url: (parent) => `http://yoursite.com/img/${parent.id}.jpg`,
  },
};

// 2. Create a new instance of the server.
// 3. Send it an object with typeDefs (the schema) and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// 4. Call listen on the server to launch the web server
server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`));
