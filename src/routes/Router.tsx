import {HashRouter, Route, Redirect, Switch} from "react-router-dom";
import {FunctionComponent} from "react";
import LoginBoard from "routes/LoginBoard/LoginBoard";
import NewBoard from "routes/NewBoard/NewBoard";
import BoardGuard from "routes/Board/BoardGuard";
import PrivateRoute from "routes/PrivateRoute";

const Router = () => (
  <HashRouter>
    <Switch>
      <Redirect exact from="/" to="/new" />
      <Route path="/new" component={NewBoard as FunctionComponent} />
      <Route path="/login" component={LoginBoard as FunctionComponent} />
      <PrivateRoute path="/board/:id" component={BoardGuard as FunctionComponent} />
    </Switch>
  </HashRouter>
);

export default Router;
