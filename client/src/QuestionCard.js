import React from "react";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import styled from "styled-components";

import Answer from "./Answer";

const questionPrefixes = ["A", "B", "C", "D", "E"];

export default function QuestionCard({
  content,
  answers = [],
  validated,
  handleOnAnswerClick,
  handleOnValidationClick,
  handleOnNextClick,
}) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" color="textSecondary" gutterBottom>
          {content}
        </Typography>
        {answers.map((answer, index) => (
          <Answer
            key={answer.id}
            prefix={questionPrefixes[index]}
            onClick={handleOnAnswerClick}
            shouldRevealValidity={validated}
            {...answer}
          />
        ))}
      </CardContent>
      <hr />
      <StyledCardActions>
        <Button
          size="small"
          onClick={!validated ? handleOnValidationClick : handleOnNextClick}
        >
          {!validated ? "Check" : "Next"}
        </Button>
      </StyledCardActions>
    </Card>
  );
}

const StyledCardActions = styled(CardActions)`
  && {
    justify-content: center;
  }
`;
