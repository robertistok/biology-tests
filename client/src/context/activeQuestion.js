import React, { useReducer, useMemo, useContext } from "react";

import { shuffleArray } from "../lib/helpers";

const ActiveQuestionContext = React.createContext();

const CHANGE_ACTIVE_QUESTION = "CHANGE_ACTIVE_QUESTION";
const UPDATE_ANSWER = "UPDATE_ANSWER";
const VALIDATE_QUESTION = "VALIDATE_QUESTION";
const COMPLETE_QUESTION = "COMPLETE_QUESTION";

function reducer(state, action) {
  switch (action.type) {
    case CHANGE_ACTIVE_QUESTION: {
      return {
        ...action.payload,
        answers: shuffleArray(action.payload.answers),
        completed: false,
        validated: false,
        index: !isNaN(action.payload.index)
          ? action.payload.index
          : state.index + 1,
      };
    }

    case UPDATE_ANSWER: {
      let { id, shouldSelect } = action.payload;
      return {
        ...state,
        answers: state.answers.map((a) =>
          a.id === id ? { ...a, selected: shouldSelect } : a
        ),
      };
    }

    case VALIDATE_QUESTION: {
      let { isValid } = action.payload;

      return { ...state, isValid, validated: true };
    }

    case COMPLETE_QUESTION: {
      return { ...state, completed: true };
    }

    default: {
      throw new Error(`Unsupported action type: ${action.type}`);
    }
  }
}

export const ActiveQuestionProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, null);
  const value = useMemo(() => [state, dispatch], [state]);

  return <ActiveQuestionContext.Provider value={value} {...props} />;
};

export const useActiveQuestion = () => {
  const context = useContext(ActiveQuestionContext);

  if (!context) {
    throw new Error(
      `useActiveQuestion must be used within a ActiveQuestionProvider`
    );
  }
  const [state, dispatch] = context;

  const changeActiveQuestion = (payload) =>
    dispatch({ type: CHANGE_ACTIVE_QUESTION, payload });

  const updateAnswer = ({ id, shouldSelect }) =>
    dispatch({ type: UPDATE_ANSWER, payload: { id, shouldSelect } });

  const validateQuestion = ({ isValid }) =>
    dispatch({ type: VALIDATE_QUESTION, payload: { isValid } });

  const completeQuestion = () => dispatch({ type: COMPLETE_QUESTION });

  return {
    state,
    dispatch,
    changeActiveQuestion,
    updateAnswer,
    validateQuestion,
    completeQuestion,
  };
};
