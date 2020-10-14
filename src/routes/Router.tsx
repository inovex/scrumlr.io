import * as React from 'react';
import { HashRouter, Route, Redirect, Switch } from 'react-router-dom';

import LoginBoard from './LoginBoard/LoginBoard';
import NewBoard from './NewBoard/NewBoard';
import Board from './Board/Board';
import PrivateRoute from './PrivateRoute';

const Router = () => (
    <HashRouter>
        <Switch>
            <Redirect exact from="/" to="/new" /> 
            <Route path="/new" component={NewBoard as any} />
            <Route path="/login" component={LoginBoard as any} />
            <PrivateRoute path="/board/:id" component={Board as any}/>
        </Switch>
    </HashRouter>
);

export default Router;