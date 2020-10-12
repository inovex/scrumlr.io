<<<<<<< HEAD
import { createStore, applyMiddleware } from 'redux';
import  rootReducer from './rootReducer';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));
=======
import { createStore } from 'redux';
import  rootReducer from './rootReducer';

const store = createStore(rootReducer);
>>>>>>> main

export default store;