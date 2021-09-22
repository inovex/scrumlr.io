import queryString from "query-string";
import {useEffect, useState} from "react";
import Parse from "parse";
import {API} from "api";
import LoadingScreen from "components/LoadingScreen/LoadingScreen";
import {useLocation} from "react-router";
import ErrorPage from "components/ErrorPage/ErrorPage";

function AuthRedirect() {
  const [status, setStatus] = useState<{error?: string; redirect?: string}>({});
  const location = useLocation();
  const params = queryString.parse(location.search);

  useEffect(() => {
    if (params.error) {
      setStatus({error: params.error as string});
    } else if (params.code && params.state) {
      /**
       * GOOGLE-OAUTH
       * */
      if ((params.state as string).startsWith("google")) {
        API.verifyGoogleSignIn(params.code as string, params.state as string)
          .then((res) => {
            const user = new Parse.User();
            const authData = {
              id: res.user.id,
              id_token: res.user.idToken,
              access_token: res.user.accessToken,
            };
            user.linkWith("google", {authData}).then(() => {
              user.set("displayName", res.user.name);
              user.save().then(() => {
                window.location.href = res.redirectURL;
              });
            });
          })
          .catch(() => {
            setStatus({error: "State does not match"});
          });
      }

      /**
       * GITHUB-OAUTH
       * */
      if ((params.state as string).startsWith("github")) {
        API.verifyGithubSignIn(params.code as string, params.state as string)
          .then((res) => {
            const user = new Parse.User();
            const authData = {
              id: res.user.id,
              access_token: res.user.accessToken,
            };
            user.linkWith("github", {authData}).then(() => {
              user.set("displayName", res.user.name);
              user.save().then(() => {
                window.location.href = res.redirectURL;
              });
            });
          })
          .catch(() => {
            setStatus({error: "State does not match"});
          });
      }

      /**
       * MICROSOFT-OAUTH
       * */
      if ((params.state as string).startsWith("microsoft")) {
        API.verifyMicrosoftSignIn(params.code as string, params.state as string)
          .then((res) => {
            const user = new Parse.User();
            const authData = {
              id: res.user.id,
              access_token: res.user.accessToken,
            };
            user.linkWith("microsoft", {authData}).then(() => {
              user.set("displayName", res.user.name);
              user.save().then(() => {
                window.location.href = res.redirectURL;
              });
            });
          })
          .catch(() => {
            setStatus({error: "State does not match"});
          });
      }
    } else {
      setStatus({error: "Not a valid entrypoint"});
    }
  }, [params.code, params.error, params.state]);

  if (status.error) {
    return <ErrorPage errorMessage="Oops! Unable to sign in." />;
  }

  return <LoadingScreen />;
}

export default AuthRedirect;
