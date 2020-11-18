import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import {ReactReduxFirebaseProvider } from 'react-redux-firebase';
import { createFirestoreInstance } from 'redux-firestore';
import './index.scss';
import firebase from './firebaseSetup';
import store from './store/store';
import Router from './routes/Router';
import { ToastContainer } from 'react-toastify';
import Board from "components/Board/Board";
import Column from "components/Column/Column";


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

        <Router/>
        <ToastContainer/>
        <Board>
          <Column color="blue">Affe</Column>
          <Column color="purple">Bär</Column>
          <Column color="violet">Chamäleon</Column>
          <Column color="pink">Delfin</Column>
          <Column color="blue">Elefant</Column>
          <Column color="purple">Fuchs</Column>
          <Column color="violet">Giraffe</Column>
          <Column color="pink">Hund</Column>
          <Column color="blue">Igel</Column>
        </Board>

      </ReactReduxFirebaseProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

