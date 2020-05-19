import React, { useEffect } from "react";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

import QuestionCard from "./QuestionCard";

import { useActiveQuestion } from "./context/activeQuestion";

const GET_QUESTIONS = gql`
  {
    questions: Question(order_by: { lastSeenAt: asc_nulls_first }, limit: 50) {
      content
      answers {
        id
        valid
        content
      }
    }
  }
`;

const Questions = () => {
  const { data: { questions } = {} } = useQuery(GET_QUESTIONS);
  const {
    state: activeQuestion,
    changeActiveQuestion,
    updateAnswer,
    validateQuestion,
    completeQuestion,
  } = useActiveQuestion();

  useEffect(() => {
    if (questions && !activeQuestion.initialized) {
      changeActiveQuestion(questions[0]);
    }
  }, [questions, changeActiveQuestion, activeQuestion]);

  useEffect(() => {
    if (activeQuestion && activeQuestion.completed) {
      if (activeQuestion.index !== questions.length - 1) {
        changeActiveQuestion(questions[activeQuestion.index + 1]);
      }
    }
  }, [activeQuestion, questions, changeActiveQuestion]);

  const handleOnAnswerClick = ({ id, shouldSelect }) => {
    if (!activeQuestion.validated) {
      updateAnswer({ id, shouldSelect });
    }
  };

  const handleOnValidationClick = () => {
    const isValid = activeQuestion.answers
      .filter(({ valid }) => Boolean(valid))
      .every(({ selected }) => Boolean(selected));

    validateQuestion({ ...activeQuestion, isValid, validated: true });
  };

  const handleOnNextClick = () => {
    completeQuestion();
  };

  return (
    <QuestionCard
      {...activeQuestion}
      handleOnAnswerClick={handleOnAnswerClick}
      handleOnValidationClick={handleOnValidationClick}
      handleOnNextClick={handleOnNextClick}
    />
  );
};

export default Questions;
