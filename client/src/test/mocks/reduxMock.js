import { createStore } from 'redux';
import rootReducer from '../../redux/reducers';

export const mockStore = (initialState = {}) => {
  return createStore(rootReducer, initialState);
};

export const mockState = {
  auth: {
    user: {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'volunteer',
    },
    isAuthenticated: true,
    loading: false,
  },
  tasks: {
    tasks: [
      {
        _id: '1',
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        priority: 'high',
      },
    ],
    loading: false,
  },
  ui: {
    alerts: [],
    loading: false,
  },
};
