import {Navigate} from "react-router-dom";
import Parse from "parse";
import {useLocation} from "react-router";
import {FC} from "react";

export const RequireAuthentication: FC = ({children}) => {
  const location = useLocation();
  const currentUser = Parse.User.current();
  if (currentUser) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }
  return <Navigate to="/login" state={{from: location}} />;
};

export default RequireAuthentication;
