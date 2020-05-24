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
    <StyledCard>
      <CardContent>
        <StyledTitle variant="h5" color="textSecondary" gutterBottom>
          {content}
        </StyledTitle>
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
      <StyledCardActions>
        <Button
          size="medium"
          color="primary"
          fullWidth
          onClick={!validated ? handleOnValidationClick : handleOnNextClick}
        >
          {!validated ? "Check" : "Next"}
        </Button>
      </StyledCardActions>
    </StyledCard>
  );
}

const StyledCardActions = styled(CardActions)`
  && {
    justify-content: center;
  }
`;

const StyledCard = styled(Card)`
  && {
    margin-top: 100px;
    min-height: 350px;

    @media screen and (max-width: 500px) {
      margin-top: 30px;
    }
  }
`;

const StyledTitle = styled(Typography)`
  && {
    text-decoration: underline;
    margin-bottom: 20px;
  }
`;
