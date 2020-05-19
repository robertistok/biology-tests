import React, { useReducer, useMemo, useContext } from "react";

const CountContext = React.createContext();

const CHANGE_ACTIVE_QUESTION = "CHANGE_ACTIVE_QUESTION";
const UPDATE_ANSWER = "UPDATE_ANSWER";
const VALIDATE_QUESTION = "VALIDATE_QUESTION";
const COMPLETE_QUESTION = "COMPLETE_QUESTION";

function reducer(state, action) {
  switch (action.type) {
    case CHANGE_ACTIVE_QUESTION: {
      return {
        ...action.payload,
        initialized: true,
        completed: false,
        validated: false,
        index: !isNaN(state.index) ? state.index + 1 : 0,
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
  const [state, dispatch] = useReducer(reducer, { initialized: false });
  const value = useMemo(() => [state, dispatch], [state]);

  return <CountContext.Provider value={value} {...props} />;
};

export const useActiveQuestion = () => {
  const context = useContext(CountContext);

  if (!context) {
    throw new Error(`useCount must be used within a CountProvider`);
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
