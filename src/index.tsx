import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import * as serviceWorker from './serviceWorker';
import Router from './pages/routing/Router';
import Session from './domain/auth/components/Session';
import store from './domain/rootStore';
import { Provider } from 'mobx-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserConsent from './domain/privacy/components/UserConsent';
import { theme } from './style/theme';
import { ThemeProvider } from '@material-ui/core';

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <Provider {...store}>
            <Session>
                <Router />
            </Session>
            <ToastContainer position={toast.POSITION.TOP_RIGHT} />
        </Provider>
        <UserConsent />
    </ThemeProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
