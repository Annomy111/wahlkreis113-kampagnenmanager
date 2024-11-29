import {
  GET_TASKS_REQUEST,
  GET_TASKS_SUCCESS,
  GET_TASKS_FAIL,
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK
} from '../types';
import api from '../../utils/api';
import { setAlert } from './uiActions';

// Get all tasks
export const getTasks = () => async dispatch => {
  try {
    dispatch({ type: GET_TASKS_REQUEST });

    const res = await api.get('/tasks');

    dispatch({
      type: GET_TASKS_SUCCESS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: GET_TASKS_FAIL,
      payload: err.response.data.message
    });

    dispatch(setAlert(err.response.data.message, 'error'));
  }
};

// Create new task
export const createTask = (taskData) => async dispatch => {
  try {
    const res = await api.post('/tasks', taskData);

    dispatch({
      type: CREATE_TASK,
      payload: res.data
    });

    dispatch(setAlert('Aufgabe erfolgreich erstellt', 'success'));
  } catch (err) {
    dispatch(setAlert(err.response.data.message, 'error'));
  }
};

// Update task
export const updateTask = (id, taskData) => async dispatch => {
  try {
    const res = await api.put(`/tasks/${id}`, taskData);

    dispatch({
      type: UPDATE_TASK,
      payload: res.data
    });

    dispatch(setAlert('Aufgabe erfolgreich aktualisiert', 'success'));
  } catch (err) {
    dispatch(setAlert(err.response.data.message, 'error'));
  }
};

// Delete task
export const deleteTask = (id) => async dispatch => {
  try {
    await api.delete(`/tasks/${id}`);

    dispatch({
      type: DELETE_TASK,
      payload: id
    });

    dispatch(setAlert('Aufgabe erfolgreich gelöscht', 'success'));
  } catch (err) {
    dispatch(setAlert(err.response.data.message, 'error'));
  }
};
