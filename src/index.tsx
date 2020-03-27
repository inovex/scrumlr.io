import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import firebase from 'firebase';
import { combineReducers, createStore } from 'redux';
import { firebaseReducer, ReactReduxFirebaseProvider } from 'react-redux-firebase';
import { createFirestoreInstance, firestoreReducer } from 'redux-firestore';
import { Provider as ReduxProvider } from 'react-redux';
import Router from './routing/Router';
import { ThemeProvider } from '@material-ui/core';
import { theme } from './style/theme';

// init firebase
const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: `${projectId}.firebaseapp.com`,
    databaseURL: `https://${projectId}.firebaseio.com`,
    projectId: `${projectId}`,
    storageBucket: `${projectId}.appspot.com`,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

firebase.initializeApp(firebaseConfig);
firebase.firestore();

// init redux
const reactReduxFirebaseConfig = {
    userProfile: 'users',
    useFirestoreForProfile: true
};

const rootReducer = combineReducers({
    firebase: firebaseReducer,
    firestore: firestoreReducer
});

const initialState = {};
const store = createStore(rootReducer, initialState);

const reactReduxFirebaseProps = {
    firebase,
    config: reactReduxFirebaseConfig,
    dispatch: store.dispatch,
    createFirestoreInstance
};

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <ReduxProvider store={store}>
                <ReactReduxFirebaseProvider {...reactReduxFirebaseProps}>
                    <Router />
                </ReactReduxFirebaseProvider>
            </ReduxProvider>
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
