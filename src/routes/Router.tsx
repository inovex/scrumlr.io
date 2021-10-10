import {Route, Redirect, Switch, BrowserRouter} from "react-router-dom";
import {FunctionComponent} from "react";
import {LoginBoard} from "routes/LoginBoard";
import {NewBoard} from "routes/NewBoard";
import {BoardGuard} from "routes/Board";
import PrivateRoute from "routes/PrivateRoute";
import {AuthRedirect} from "routes/AuthRedirect";
import PassphraseDialog from "../components/PassphraseDialog/PassphraseDialog";

const Router = () => (
  <BrowserRouter>
    <Switch>
      <Redirect exact from="/" to="/new" />
      <Route path="/new" component={NewBoard as FunctionComponent} />
      <Route path="/login" component={LoginBoard as FunctionComponent} />
      <Route path="/auth/redirect" component={AuthRedirect as FunctionComponent} />
      <Route path="/test">
        <PassphraseDialog onPassphrase={() => Promise.resolve(false)} />
      </Route>
      <PrivateRoute path="/board/:id" component={BoardGuard as FunctionComponent} />
    </Switch>
  </BrowserRouter>
);

export default Router;
