import React, { useEffect } from "react";
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Typography from "@material-ui/core/Typography";

import QuestionCard from "./QuestionCard";

import { useActiveQuestion } from "./context/activeQuestion";
import { useStatsHistory } from "./context/statsHistory";

import usePrevious from "./hooks/usePrevious";

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
  const { data: { questions } = {}, refetch: refetchQuestions } = useQuery(
    GET_QUESTIONS
  );
  const [updateQuestion] = useMutation(UPDATE_QUESTION);
  const prevQuestions = usePrevious(questions);

  const {
    state: activeQuestion,
    changeActiveQuestion,
    updateAnswer,
    validateQuestion,
    completeQuestion,
  } = useActiveQuestion();
  const {
    state: { today },
    updateTodaysHistory,
  } = useStatsHistory();

  useEffect(() => {
    if (questions && questions !== prevQuestions) {
      changeActiveQuestion({ ...questions[0], index: 0 });
    }
  }, [questions, prevQuestions, changeActiveQuestion]);

  useEffect(() => {
    if (activeQuestion && activeQuestion.completed) {
      if (activeQuestion.index !== questions.length - 1) {
        changeActiveQuestion(questions[activeQuestion.index + 1]);
      } else {
        refetchQuestions();
      }
    }
  }, [questions, changeActiveQuestion, activeQuestion, refetchQuestions]);

  const handleOnAnswerClick = ({ id, shouldSelect }) => {
    if (!activeQuestion.validated) {
      updateAnswer({ id, shouldSelect });
    }
  };

  const handleOnValidationClick = () => {
    const isValid = activeQuestion.answers
      .filter(({ valid }) => Boolean(valid))
      .every(({ selected }) => Boolean(selected));

    if (process.env.NODE_ENV !== "development") {
      updateQuestion({
        variables: {
          where: { id: { _eq: activeQuestion.id } },
          _set: { lastSeenAt: new Date() },
        },
      });

      const newHistoryEntry = {
        questionId: activeQuestion.id,
        selectedAnswers: activeQuestion.answers
          .filter((a) => a.selected)
          .map((a) => a.id),
        isValid,
        ts: new Date().toISOString(),
      };

      updateTodaysHistory({ newHistoryEntry });
    }

    validateQuestion({ ...activeQuestion, isValid, validated: true });
  };

  const entries = today ? today.state.entries : [];
  const correctAnswers = entries.filter((e) => e.isValid);

  const handleOnNextClick = () => {
    completeQuestion();
  };

  return (
    <>
      <QuestionCard
        {...activeQuestion}
        handleOnAnswerClick={handleOnAnswerClick}
        handleOnValidationClick={handleOnValidationClick}
        handleOnNextClick={handleOnNextClick}
      />
      {entries.length !== 0 && (
        <Typography variant="h5">
          Correct today: {correctAnswers.length} of the {entries.length}
        </Typography>
      )}
    </>
  );
};

export default Questions;
