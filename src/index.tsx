import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {ReactReduxFirebaseProvider } from 'react-redux-firebase';
import { createFirestoreInstance } from 'redux-firestore';
import './index.scss';
import firebase from './firebaseSetup';
import store from './store/store';
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
          <Column className="color-blue">A</Column>
          <Column className="color-purple">B</Column>
          <Column className="color-violet">C</Column>
          <Column className="color-pink">D</Column>
          <Column className="color-blue">E</Column>
          <Column className="color-purple">F</Column>
          <Column className="color-violet">G</Column>
          <Column className="color-pink">H</Column>
          <Column className="color-blue">I</Column>
        </Board>
      </ReactReduxFirebaseProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

