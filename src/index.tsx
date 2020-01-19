import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import * as serviceWorker from './serviceWorker';
import Router from './pages/routing/Router';
import Session from './domain/auth/components/Session';
import store from './domain/rootStore';
import { Provider } from 'mobx-react';

ReactDOM.render(
    <Provider {...store}>
        <Session>
            <Router />
        </Session>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
