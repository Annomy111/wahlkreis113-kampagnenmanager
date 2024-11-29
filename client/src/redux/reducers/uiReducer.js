import { SET_ALERT, REMOVE_ALERT, SET_LOADING } from '../types';

const initialState = {
  alerts: [],
  loading: false
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_ALERT:
      return {
        ...state,
        alerts: [...state.alerts, payload]
      };
    case REMOVE_ALERT:
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== payload)
      };
    case SET_LOADING:
      return {
        ...state,
        loading: payload
      };
    default:
      return state;
  }
}
