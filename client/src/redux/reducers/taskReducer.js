import {
  GET_TASKS_REQUEST,
  GET_TASKS_SUCCESS,
  GET_TASKS_FAIL,
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK
} from '../types';

const initialState = {
  tasks: [],
  loading: false,
  error: null
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_TASKS_REQUEST:
      return {
        ...state,
        loading: true
      };
    case GET_TASKS_SUCCESS:
      return {
        ...state,
        loading: false,
        tasks: payload,
        error: null
      };
    case GET_TASKS_FAIL:
      return {
        ...state,
        loading: false,
        error: payload
      };
    case CREATE_TASK:
      return {
        ...state,
        tasks: [...state.tasks, payload],
        loading: false
      };
    case UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task._id === payload._id ? payload : task
        ),
        loading: false
      };
    case DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== payload),
        loading: false
      };
    default:
      return state;
  }
}
