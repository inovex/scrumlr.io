import {Navigate} from "react-router-dom";
import Parse from "parse";
import {useLocation} from "react-router";
import {ReactNode, useEffect, useState} from "react";
import {LoadingScreen} from "../components/LoadingScreen";

const RequireAuthentication = function({children}: {children: ReactNode}) {
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
    return <>{children}</>;
  }
  return <Navigate to="/login" state={{from: location}} />;
}

export default RequireAuthentication;
