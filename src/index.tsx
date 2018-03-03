import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import HTML5Backend from 'react-dnd-html5-backend';
import * as Raven from 'raven-js';

import Router from './Router';
import configureStore from './store';
import './index.css';
import { getFirebase } from 'react-redux-firebase';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import { sentry } from './config';

// types not available
const dnd = require('react-dnd');

const store = configureStore({});

if (Boolean(sentry.dsn)) {
  Raven.config(sentry.dsn).install();
}

window.addEventListener('unhandledrejection', (err: PromiseRejectionEvent) => {
  Raven.captureMessage(err.reason);
});

const renderLoadingScreen = () => {
  ReactDOM.render(
    <LoadingScreen />,
    document.getElementById('root') as HTMLElement
  );
};

const renderApp = () => {
  ReactDOM.render(
    <Provider store={store}>
      <dnd.DragDropContextProvider backend={HTML5Backend}>
        <Router />
      </dnd.DragDropContextProvider>
    </Provider>,
    document.getElementById('root') as HTMLElement
  );
};

renderLoadingScreen();

getFirebase()
  .auth()
  .getRedirectResult()
  .then(() => renderApp())
  .catch((error: Error) => {
    Raven.captureMessage('Unable to authenticate', {
      extra: {
        reason: error
      }
    });
    renderApp();
  });
