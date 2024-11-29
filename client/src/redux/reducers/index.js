import { combineReducers } from 'redux';
import authReducer from './authReducer';
import taskReducer from './taskReducer';
import uiReducer from './uiReducer';

export default combineReducers({
  auth: authReducer,
  tasks: taskReducer,
  ui: uiReducer
});
