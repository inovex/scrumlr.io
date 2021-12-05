import {Navigate} from "react-router-dom";
import Parse from "parse";
import {useLocation} from "react-router";
import {ReactNode} from "react";

export const RequireAuthentication = ({children}: {children: ReactNode}) => {
  const location = useLocation();
  const currentUser = Parse.User.current();
  if (currentUser) {
    return children;
  }
  return <Navigate to="/login" state={{from: location}} />;
};

export default RequireAuthentication;
