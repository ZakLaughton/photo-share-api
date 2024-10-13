// 1. Require 'apollo-server'
const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const { GraphQLScalarType } = require("graphql");
const expressPlayground =
  require("graphql-playground-middleware-express").default;

const typeDefs = `
    type Query {
        totalPhotos: Int!
    }

    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        postedBy: User!
        taggedUsers: [User!]!
        created: DateTime!
    }

    input PostPhotoInput {
        name: String!
        category: PhotoCategory=PORTRAIT
        description: String
    }

    type User {
        githubLogin: ID!
        name: String
        avatar: String
        postedPhotos: [Photo!]!
        inPhotos: [Photo!]!
    }

    type Mutation {
        postPhoto(input: PostPhotoInput!): Photo!
    }

    enum PhotoCategory {
      SELFIE
      PORTRAIT
      ACTION
      LANDSCAPE
      GRAPHIC
    }

    scalar DateTime

    type Query {
        totalPhotos: Int!
        allPhotos: [Photo!]!
    }
`;

let _id = 0;
var users = [
  { githubLogin: "mHattrup", name: "Mike Hattrup" },
  { githubLogin: "gPlake", name: "Glen Plake" },
  { githubLogin: "sSchmidt", name: "Scot Schmidt" },
];

var photos = [
  {
    id: "1",
    name: "Dropping the Heart Chute",
    description: "The heart chute is one of my favorite chutes",
    category: "ACTION",
    githubUser: "gPlake",
    created: "3-28-1977",
  },
  {
    id: "2",
    name: "Enjoying the sunshine",
    category: "SELFIE",
    githubUser: "sSchmidt",
    created: "1-2-1985",
  },
  {
    id: "3",
    name: "Gunbarrel 25",
    description: "25 laps on gunbarrel today",
    category: "LANDSCAPE",
    githubUser: "sSchmidt",
    created: "2018-04-15T19:09:57.308Z",
  },
];

var tags = [
  { photoID: "1", userID: "gPlake" },
  { photoID: "2", userID: "sSchmidt" },
  { photoID: "2", userID: "mHattrup" },
  { photoID: "2", userID: "gPlake" },
];
const serialize = (value) => new Date(value).toISOString();

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
        ...args.input,
      };
      photos.push(newPhoto);
      // Return the new photo
      return newPhoto;
    },
  },
  Photo: {
    url: (parent) => `http://yoursite.com/img/${parent.id}.jpg`,
    postedBy: (parent) => {
      return users.find((u) => u.githubLogin === parent.githubUser);
    },
    taggedUsers: (parent) =>
      tags
        .filter((tag) => tag.photoID === parent.id)
        .map((tag) => tag.userID)
        .map((userID) => users.find((u) => u.githubLogin === userID)),
  },
  User: {
    postedPhotos: (parent) => {
      return photos.filter((p) => p.githubUser === parent.githubLogin);
    },
    inPhotos: (parent) =>
      tags
        .filter((tag) => tag.userID === parent.githubLogin)
        .map((tag) => tag.photoID)
        .map((photoID) => photos.find((p) => p.id === photoID)),
  },
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "A valid date time value.",
    parseValue: (value) => new Date(value),
    serialize: (value) => new Date(value).toISOString(),
    parseLiteral: (ast) => ast.value,
  }),
};

// Old apollo server setup (not express)
// server
//   .listen()
//   .then(({ url }) => console.log(`GraphQL Service running on ${url}`));

var app = express();

let server = null;

async function startServer() {
  server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();
  server.applyMiddleware({ app });
}
startServer();

// 4. Create a home route
app.get("/", (req, res) => res.end("Welcome to the PhotoShare API"));
app.get("/playground", expressPlayground({ endpoint: "/graphql" }));

// 5. Listen on a specific port
app.listen({ port: 4000 }, () =>
  console.log(
    `GraphQL Server running @ http://localhost:4000${server.graphqlPath}`,
  ),
);
