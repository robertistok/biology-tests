import React, { useReducer, useMemo, useContext, useEffect } from "react";
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";

import usePrevious from "../hooks/usePrevious";

const StatsHistoryContext = React.createContext();

const UPDATE_HISTORY_STATE = "UPDATE_HISTORY_STATE";

function reducer(state, action) {
  switch (action.type) {
    case UPDATE_HISTORY_STATE:
      return {
        ...state,
        ...action.payload,
      };
    default: {
      throw new Error(`Unsupported action type: ${action.type}`);
    }
  }
}

export const StatsHistoryProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, {
    today: null,
    last7Days: null,
    allTime: null,
  });
  const value = useMemo(() => [state, dispatch], [state]);

  return <StatsHistoryContext.Provider value={value} {...props} />;
};

const GET_HISTORY = gql`
  query GET_HISTORY($todaysDate: date!) {
    history: History(
      where: { date: { _eq: $todaysDate } }
      order_by: { date: desc }
      limit: 1
    ) {
      state
      date
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

export const useStatsHistory = () => {
  const context = useContext(StatsHistoryContext);

  if (!context) {
    throw new Error(
      `useStatsHistory must be used within a StatsHistoryProvider`
    );
  }
  const [state, dispatch] = context;

  const todaysDate = new Date().toISOString().slice(0, 10);
  const { data: { history } = {} } = useQuery(GET_HISTORY, {
    variables: { todaysDate },
  });
  const [updateHistory] = useMutation(UPDATE_HISTORY, {
    refetchQueries: ["GET_HISTORY"],
  });
  const prevHistory = usePrevious(history);

  useEffect(() => {
    if (history && history !== prevHistory) {
      const today = history[0];
      const last7Days = history.slice(0, 7);
      const allTime = history;

      dispatch({
        type: UPDATE_HISTORY_STATE,
        payload: { today, last7Days, allTime },
      });
    }
  }, [history, prevHistory, dispatch]);

  const updateTodaysHistory = ({ newHistoryEntry }) => {
    const { today } = state;

    updateHistory({
      variables: {
        object: {
          date: todaysDate,
          state:
            today && today.state
              ? {
                  ...today.state,
                  entries: [...today.state.entries, newHistoryEntry],
                }
              : {
                  entries: [newHistoryEntry],
                },
        },
      },
    });
  };

  return {
    state,
    dispatch,
    updateTodaysHistory,
  };
};
