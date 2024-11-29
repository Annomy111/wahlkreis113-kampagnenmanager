import { SET_ALERT, REMOVE_ALERT, SET_LOADING } from '../types';

// Set Alert
export const setAlert = (msg, alertType, timeout = 5000) => dispatch => {
  const id = Math.random().toString(36).substr(2, 9);
  
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id }
  });

  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};

// Set Loading State
export const setLoading = (isLoading) => dispatch => {
  dispatch({
    type: SET_LOADING,
    payload: isLoading
  });
};
