const { GraphQLScalarType } = require("graphql");

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
module.exports = resolvers;
