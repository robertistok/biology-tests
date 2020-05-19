import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import Container from "@material-ui/core/Container";

import Questions from "./Questions";
import { ActiveQuestionProvider } from "./context/activeQuestion";

import client from "./lib/graphqlClient";

function App() {
  return (
    <ApolloProvider client={client}>
      <Container maxWidth="sm">
        <ActiveQuestionProvider>
          <Questions />
        </ActiveQuestionProvider>
      </Container>
    </ApolloProvider>
  );
}

export default App;
