import ApolloClient from "apollo-boost";

const client = new ApolloClient({
  uri: "https://biology-hasura.herokuapp.com/v1/graphql",
});

export default client;
