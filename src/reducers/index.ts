import { combineReducers } from 'redux';
import { firebaseStateReducer } from 'react-redux-firebase';

import { StoreState } from '../types/index';
import { app } from './app';

export * from './app';

const rootReducer = combineReducers<StoreState>({
  fbState: firebaseStateReducer,
  app
});

export default rootReducer;
