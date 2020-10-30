import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {ReactReduxFirebaseProvider } from 'react-redux-firebase';
import { createFirestoreInstance } from 'redux-firestore';
import './index.scss';
import firebase from './firebaseSetup';
import store from './store/store';
//import Router from './routes/Router';
import Board from "./components/Board";
import Column from "./components/Column";

const rrfProps = {
  firebase,
  config: {
    userProfile: 'users',
    useFirestoreForProfile: true
  },
  dispatch: store.dispatch,
  createFirestoreInstance
};

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <Board>
          <Column>A</Column>
          <Column>B</Column>
          <Column>C</Column>
          <Column>D</Column>
          <Column>E</Column>
          <Column>F</Column>
          <Column>G</Column>
          <Column>H</Column>
          <Column>I</Column>
        </Board>
      </ReactReduxFirebaseProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

