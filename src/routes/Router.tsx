import {Route, Redirect, Switch, BrowserRouter} from "react-router-dom";

import LoginBoard from "./LoginBoard/LoginBoard";
import NewBoard from "./NewBoard/NewBoard";
import BoardGuard from "./Board/BoardGuard";
import PrivateRoute from "./PrivateRoute";
import AuthRedirect from "./AuthRedirect/AuthRedirect";

const Router = () => (
  <BrowserRouter basename={process.env.PUBLIC_URL}>
    <Switch>
      <Redirect exact from="/" to="/new" />
      <Route path="/new" component={NewBoard as any} />
      <Route path="/login" component={LoginBoard as any} />
      <Route path="/auth/redirect" component={AuthRedirect as any} />
      <PrivateRoute path="/board/:id" component={BoardGuard as any} />
    </Switch>
  </BrowserRouter>
);

export default Router;
