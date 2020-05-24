import React, { useEffect } from "react";
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";

import QuestionCard from "./QuestionCard";

import { useActiveQuestion } from "./context/activeQuestion";
import { shuffleArray } from "./lib/helpers";

const GET_QUESTIONS = gql`
  {
    questions: Question(order_by: { lastSeenAt: asc_nulls_first }, limit: 50) {
      id
      content
      answers {
        id
        valid
        content
      }
    }
  }
`;

const UPDATE_QUESTION = gql`
  mutation UPDATE_QUESTION(
    $_set: Question_set_input
    $where: Question_bool_exp!
  ) {
    update_Question(where: $where, _set: $_set) {
      returning {
        id
      }
    }
  }
`;

const Questions = () => {
  const { data: { questions } = {} } = useQuery(GET_QUESTIONS);
  const [updateQuestion] = useMutation(UPDATE_QUESTION);

  const {
    state: activeQuestion,
    changeActiveQuestion,
    updateAnswer,
    validateQuestion,
    completeQuestion,
  } = useActiveQuestion();

  useEffect(() => {
    if (questions && !activeQuestion.initialized) {
      changeActiveQuestion(shuffleArray(questions)[0]);
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
    updateQuestion({
      variables: {
        where: { id: { _eq: activeQuestion.id } },
        _set: { lastSeenAt: new Date() },
      },
    });
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
