import * as React from 'react';
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';

import LoginBoard from './routes/LoginBoard/LoginBoard';
import NewBoard from './routes/NewBoard/NewBoard';
import Board from './routes/Board/Board';
import PrivateRoute from './routes/PrivateRoute';

const Router = () => (
    <HashRouter>
        <Switch>
            <Redirect exact from="/" to="/new" /> 
            <Route path="/new" component={NewBoard as any} />
            <Route path="/join/:id" component={LoginBoard as any} />
            <PrivateRoute path="/board/:id" component={Board as any}/>
        </Switch>
    </HashRouter>
);

export default Router;