import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import './index.scss';
import store from './store/store';
import Router from './routes/Router';
import { ToastContainer } from 'react-toastify';
import Parse from 'parse';

Parse.initialize('Scrumlr');
Parse.serverURL = 'http://localhost:1337/api';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router/>
      <ToastContainer/>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

