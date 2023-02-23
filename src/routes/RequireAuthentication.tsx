import {Navigate} from "react-router-dom";
import {useLocation} from "react-router";
import {FC, PropsWithChildren} from "react";
import {useTranslation} from "react-i18next";
import {useAppSelector} from "store";
import {LoadingScreen} from "../components/LoadingScreen";
import {ErrorPage} from "../components/ErrorPage";

export const RequireAuthentication: FC<PropsWithChildren> = ({children}) => {
  const {t} = useTranslation();
  const location = useLocation();
  const {user, initializationSucceeded} = useAppSelector((state) => state.auth);

  // wait until initialization is completed
  if (initializationSucceeded === null) {
    return <LoadingScreen />;
  }

  // show error if initialization did fail
  if (!initializationSucceeded) {
    return <ErrorPage errorMessage={t("Homepage.errorServerConnection")} originURL={location.pathname} />;
  }

  if (user) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }
  return <Navigate to="/login" state={{from: location}} />;
};

export default RequireAuthentication;
