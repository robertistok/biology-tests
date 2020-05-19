import React, { useState, useEffect } from "react";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

import QuestionCard from "./QuestionCard";

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
  const [activeQuestion, setActiveQuestion] = useState();
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  useEffect(() => {
    if (questions) {
      const questionToSet = questions[0];
      setActiveQuestion({
        ...questionToSet,
        completed: false,
        validated: false,
        index: 0,
      });
    }
  }, [questions]);

  useEffect(() => {
    if (activeQuestion && activeQuestion.completed) {
      if (activeQuestion.index !== questions.length - 1) {
        setActiveQuestion({
          ...questions[activeQuestion.index + 1],
          index: activeQuestion.index + 1,
          completed: false,
          validated: false,
        });
        setSelectedAnswers([]);
      }
    }
  }, [activeQuestion, questions]);

  const handleOnAnswerClick = ({ id, selected }) => {
    if (!activeQuestion.validated) {
      setActiveQuestion({
        ...activeQuestion,
        answers: activeQuestion.answers.map((a) =>
          a.id === id ? { ...a, selected: !selected } : a
        ),
      });
    }
  };

  const handleOnValidationClick = () => {
    const isValid = activeQuestion.answers
      .filter(({ valid }) => Boolean(valid))
      .every(({ selected }) => Boolean(selected));

    setActiveQuestion({ ...activeQuestion, isValid, validated: true });
  };

  const handleOnNextClick = () => {
    setActiveQuestion({ ...activeQuestion, completed: true });
  };

  return (
    <QuestionCard
      {...activeQuestion}
      selectedAnswers={selectedAnswers}
      handleOnAnswerClick={handleOnAnswerClick}
      handleOnValidationClick={handleOnValidationClick}
      handleOnNextClick={handleOnNextClick}
    />
  );
};

export default Questions;
