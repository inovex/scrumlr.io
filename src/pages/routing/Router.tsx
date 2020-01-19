import React from 'react';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import App from '../App';
import TestComponent from '../../view/TestComponent';

export default function Router() {
    return (
        <BrowserRouter>
            <div>
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/app">App</Link>
                        </li>
                    </ul>
                </nav>

                <Switch>
                    <Route path="/app">
                        <App />
                    </Route>
                    <Route path="/" component={() => <TestComponent />} />
                </Switch>
            </div>
        </BrowserRouter>
    );
}
