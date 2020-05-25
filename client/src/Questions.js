import React, { useEffect } from "react";
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Typography from "@material-ui/core/Typography";

import QuestionCard from "./QuestionCard";

import { useActiveQuestion } from "./context/activeQuestion";
import { shuffleArray } from "./lib/helpers";

const GET_QUESTIONS = gql`
  {
    questions: Question(order_by: { lastSeenAt: asc_nulls_first }, limit: 75) {
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

const GET_TODAYS_HISTORY = gql`
  query GET_TODAYS_HISTORY($where: History_bool_exp) {
    history: History(where: $where, order_by: { date: desc }, limit: 1) {
      state
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

const UPDATE_HISTORY = gql`
  mutation UPDATE_HISTORY($object: History_insert_input!) {
    insert_History_one(
      on_conflict: { constraint: History_date_key, update_columns: [state] }
      object: $object
    ) {
      id
    }
  }
`;

const Questions = () => {
  const { data: { questions } = {}, refetch: refetchQuestions } = useQuery(
    GET_QUESTIONS
  );
  const { data: { history: [history] = [] } = {} } = useQuery(
    GET_TODAYS_HISTORY,
    {
      variables: {
        where: { date: { _eq: new Date().toISOString().slice(0, 10) } },
      },
    }
  );
  const [updateQuestion] = useMutation(UPDATE_QUESTION);
  const [updateHistory] = useMutation(UPDATE_HISTORY);

  const {
    state: activeQuestion,
    changeActiveQuestion,
    updateAnswer,
    validateQuestion,
    completeQuestion,
  } = useActiveQuestion();

  useEffect(() => {
    if (questions && !activeQuestion) {
      changeActiveQuestion(shuffleArray(questions)[0]);
    }
  }, [questions, changeActiveQuestion, activeQuestion]);

  useEffect(() => {
    if (activeQuestion && activeQuestion.completed) {
      if (activeQuestion.index !== questions.length - 1) {
        changeActiveQuestion(questions[activeQuestion.index + 1]);
      }
    }
  }, [activeQuestion, questions, changeActiveQuestion, refetchQuestions]);

  const handleOnAnswerClick = ({ id, shouldSelect }) => {
    if (!activeQuestion.validated) {
      updateAnswer({ id, shouldSelect });
    }
  };

  const handleOnValidationClick = () => {
    const isValid = activeQuestion.answers
      .filter(({ valid }) => Boolean(valid))
      .every(({ selected }) => Boolean(selected));

    const newHistoryEntry = {
      questionId: activeQuestion.id,
      selectedAnswers: activeQuestion.answers
        .filter((a) => a.selected)
        .map((a) => a.id),
      isValid,
      ts: new Date().toISOString(),
    };

    updateHistory({
      variables: {
        object: {
          date: new Date(),
          state:
            history && history.state
              ? {
                  ...history.state,
                  entries: [...history.state.entries, newHistoryEntry],
                }
              : {
                  entries: [newHistoryEntry],
                },
        },
      },
      refetchQueries: ["GET_TODAYS_HISTORY"],
    });

    validateQuestion({ ...activeQuestion, isValid, validated: true });
  };

  const correctAnswers = history
    ? history.state.entries.filter((e) => e.isValid)
    : [];

  const handleOnNextClick = () => {
    completeQuestion();
    if (process.env.NODE_ENV !== "development") {
      updateQuestion({
        variables: {
          where: { id: { _eq: activeQuestion.id } },
          _set: { lastSeenAt: new Date() },
        },
      });
    }
  };

  return (
    <>
      <QuestionCard
        {...activeQuestion}
        handleOnAnswerClick={handleOnAnswerClick}
        handleOnValidationClick={handleOnValidationClick}
        handleOnNextClick={handleOnNextClick}
      />
      <Typography variant="h5">
        Correct today: {correctAnswers.length}
      </Typography>
    </>
  );
};

export default Questions;
