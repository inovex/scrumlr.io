import { createStore, compose } from 'redux';
import { reactReduxFirebase } from 'react-redux-firebase';

import rootReducer from './reducers';
import { firebase as fbConfig } from './config';
import * as firebase from 'firebase';

export default function configureStore(initialState: {}, history?: {}) {
  firebase.initializeApp(fbConfig);

  const composeEnhancers =
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const createStoreWithMiddleware = composeEnhancers(
    reactReduxFirebase(firebase, {
      userProfile: 'users',
      enableLogging: false
    })
  )(createStore);
  const store = createStoreWithMiddleware(rootReducer);

  // tslint:disable
  if ((module as any).hot) {
    // Enable Webpack hot module replacement for reducers
    (module as any).hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers');
      store.replaceReducer(nextRootReducer);
    });
  }
  // tslint:enable

  return store;
}
