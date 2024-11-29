import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT
} from '../types';
import api from '../../utils/api';
import { setAlert } from './uiActions';

// Login User
export const login = (email, password) => async dispatch => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const res = await api.post('/auth/login', { email, password });

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data
    });

    localStorage.setItem('token', res.data.token);
  } catch (err) {
    dispatch({
      type: LOGIN_FAIL,
      payload: err.response.data.message
    });

    dispatch(setAlert(err.response.data.message, 'error'));
  }
};

// Logout User
export const logout = () => dispatch => {
  localStorage.removeItem('token');
  dispatch({ type: LOGOUT });
};

// Load User
export const loadUser = () => async dispatch => {
  try {
    dispatch({ type: LOGIN_REQUEST });

    const res = await api.get('/auth/me');

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: LOGIN_FAIL,
      payload: err.response.data.message
    });
  }
};
