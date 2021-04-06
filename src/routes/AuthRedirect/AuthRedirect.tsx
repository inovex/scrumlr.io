import queryString from "query-string";
import {useEffect, useState} from "react";
import Parse from "parse";
import {API} from "../../api";

function AuthRedirect() {
  const [status, setStatus] = useState<{error?: string; redirect?: string}>({});

  useEffect(() => {
    const url = location.search;
    const params = queryString.parse(url);

    if (params.error) {
      setStatus({...status, error: params.error as string});
    }

    if (params.code) {
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
    }
  }, [status]);

  if (status.error) {
    return <span>Error: {status.error}</span>;
  }

  return <div>Waiting for auth...</div>;
}

export default AuthRedirect;
