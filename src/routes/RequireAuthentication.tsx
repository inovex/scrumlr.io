import {Navigate} from "react-router-dom";
import Parse from "parse";
import {useLocation} from "react-router";
import {useEffect, useState, FC} from "react";
import {LoadingScreen} from "../components/LoadingScreen";

const RequireAuthentication: FC = ({children}) => {
  const location = useLocation();

  const [verifiedSession, setVerifiedSession] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    Parse.Session.current()
      .then(() => {
        setVerifiedSession(true);
      })
      .catch(() => {
        setVerifiedSession(false);
      });
  }, []);

  if (verifiedSession === undefined) {
    // wait while session needs to be verified
    return <LoadingScreen />;
  }

  if (verifiedSession) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }
  return <Navigate to="/login" state={{from: location}} />;
};

export default RequireAuthentication;
