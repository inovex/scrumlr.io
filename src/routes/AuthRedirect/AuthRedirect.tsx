import queryString from "query-string";
import {useEffect, useState} from "react";
import Parse from "parse";
import {API} from "api";
import LoadingScreen from "components/LoadingScreen/LoadingScreen";
import {useLocation} from "react-router";
import ErrorPage from "components/ErrorPage/ErrorPage";

interface IAuthData {
  id: string;
  access_token: string;
  id_token?: string;
}

function AuthRedirect() {
  const [status, setStatus] = useState<{error?: string; redirect?: string}>({});
  const location = useLocation();
  const params = queryString.parse(location.search);

  useEffect(() => {
    const signInMethod = (authProvider: string): void => {
      // // after deployment for apple user name handling: API.verifySignIn(params.code as string, params.state as string, authProvider, params.user as string)
      API.verifySignIn(params.code as string, params.state as string, authProvider)
        .then((res) => {
          const user = new Parse.User();
          const authData: IAuthData = {
            id: res.user.id,
            access_token: res.user.accessToken,
          };
          if (authProvider === "google") {
            authData.id_token = res.user.idToken;
          }
          user.linkWith(authProvider, {authData}).then(() => {
            user.set("displayName", res.user.name);
            user.save().then(() => {
              window.location.href = res.redirectURL;
            });
          });
        })
        .catch(() => {
          setStatus({error: "State does not match"});
        });
    };

    if (params.error) {
      setStatus({error: params.error as string});
    } else if (params.code && params.state) {
      if ((params.state as string).startsWith("google")) {
        signInMethod("google");
      }
      if ((params.state as string).startsWith("github")) {
        signInMethod("github");
      }
      if ((params.state as string).startsWith("microsoft")) {
        signInMethod("microsoft");
      }
      if ((params.state as string).startsWith("apple")) {
        signInMethod("apple");
      }
    } else {
      setStatus({error: "Not a valid entrypoint"});
    }
  }, [params.code, params.error, params.state, params.user]);

  if (status.error) {
    return <ErrorPage errorMessage={status.error} />;
  }

  return <LoadingScreen />;
}

export default AuthRedirect;
