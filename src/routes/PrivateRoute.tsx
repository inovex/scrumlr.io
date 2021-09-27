import {Redirect, Route, RouteProps} from "react-router-dom";
import Parse from "parse";

function PrivateRoute(props: RouteProps) {
  const currentUser = Parse.User.current();
  if (currentUser) {
    return <Route {...props} />;
  }
  sessionStorage.setItem("boardId", props.location!.pathname);
  return <Redirect to={{pathname: "/login", state: {from: props.location}}} />;
}

export default PrivateRoute;
