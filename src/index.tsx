import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {ReactReduxFirebaseProvider } from 'react-redux-firebase';
import { createFirestoreInstance } from 'redux-firestore';
import './index.scss';
import firebase from './firebaseSetup';
import store from './store/store';
import Board from "./components/Board/Board";
import Column from "./components/Column/Column";

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
          <Column color="blue">A</Column>
          <Column color="purple">B</Column>
          <Column color="violet">C</Column>
          <Column color="pink">D</Column>
          <Column color="blue">E</Column>
          <Column color="purple">F</Column>
          <Column color="violet">G</Column>
          <Column color="pink">H</Column>
          <Column color="blue">I</Column>
        </Board>
      </ReactReduxFirebaseProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

