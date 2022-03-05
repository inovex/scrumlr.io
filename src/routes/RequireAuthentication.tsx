import {Navigate} from "react-router-dom";
import {useLocation} from "react-router";
import {FC} from "react";
import {useAppSelector} from "../store";
import {LoadingScreen} from "../components/LoadingScreen";

export const RequireAuthentication: FC = ({children}) => {
  const location = useLocation();
  const {user, initialized} = useAppSelector((state) => state.auth);

  if (!initialized) {
    return <LoadingScreen />;
  }

  if (user) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }
  return <Navigate to="/login" state={{from: location}} />;
};

export default RequireAuthentication;
