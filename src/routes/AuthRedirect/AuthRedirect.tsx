import queryString from "query-string";
import {useEffect, useState} from "react";
import Parse from "parse";
import {API} from "api";
import LoadingScreen from "components/LoadingScreen/LoadingScreen";
import {RouteComponentProps} from "react-router";

function AuthRedirect(props: RouteComponentProps) {
  const [status, setStatus] = useState<{error?: string}>({});

  useEffect(() => {
    const params = queryString.parse(props.location.search);

    if (params.error) {
      setStatus({...status, error: params.error as string});
    } else if (params.code && params.state) {
      API.verifyGoogleSignIn(params.code as string).then((res) => {
        const user = new Parse.User();
        const authData = {
          id: res.id,
          id_token: res.idToken,
          access_token: res.accessToken,
        };

        user.linkWith("google", {authData}).then(() => {
          user.set("displayName", res.name);
          user.save().then(() => {
            window.location.href = decodeURI(params.state as string);
          });
        });
      });
    } else {
      setStatus({error: "Not a valid redirect"});
    }
  }, [props.location.search, status]);

  if (status.error) {
    return <span>Error: {status.error}</span>;
  }

  return <LoadingScreen />;
}

export default AuthRedirect;
