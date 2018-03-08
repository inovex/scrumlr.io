import { combineReducers } from 'redux';
import { firebaseReducer } from 'react-redux-firebase';

import { StoreState } from '../types/index';
import { app } from './app';

export * from './app';

const rootReducer = combineReducers<StoreState>({
  fbState: firebaseReducer,
  app
});

export default rootReducer;
