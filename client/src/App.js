import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import Container from "@material-ui/core/Container";

import Questions from "./Questions";

import client from "./lib/graphqlClient";

function App() {
  return (
    <ApolloProvider client={client}>
      <Container maxWidth="sm">
        <Questions />
      </Container>
    </ApolloProvider>
  );
}

export default App;
