// 1. Require 'apollo-server'
const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const expressPlayground =
  require("graphql-playground-middleware-express").default;
const { readFileSync } = require("fs");
const typeDefs = readFileSync("./typeDefs.graphql", "UTF-8");
const resolvers = require("./resolvers");

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
