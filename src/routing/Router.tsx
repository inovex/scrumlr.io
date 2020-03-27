import React from 'react';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import Board from './pages/Board';
import Homepage from './pages/Homepage';
import SignIn from './pages/SignIn';
import Templates from './pages/Templates';
import ProtectedRoute from './util/ProtectedRoute';
import SessionCheck from './util/SessionCheck';

export default function Router() {
    return (
        <SessionCheck>
            <BrowserRouter>
                <div>
                    <nav>
                        <ul>
                            <li>
                                <Link to="/">Home</Link>
                            </li>
                            <li>
                                <Link to="/signIn">Sign in</Link>
                            </li>
                            <li>
                                <Link to="/templates">Create board</Link>
                            </li>
                            <li>
                                <Link to="/boards/GN00BOmWBk2vkm9xxXNZ">Test-Board</Link>
                            </li>
                        </ul>
                    </nav>

                    <Switch>
                        <Route path="/signIn" component={SignIn} />
                        <ProtectedRoute path="/templates">
                            <Templates />
                        </ProtectedRoute>
                        <ProtectedRoute path="/boards/:id">
                            <Board />
                        </ProtectedRoute>

                        <Route path="/" component={Homepage} />
                    </Switch>
                </div>
            </BrowserRouter>
        </SessionCheck>
    );
}
