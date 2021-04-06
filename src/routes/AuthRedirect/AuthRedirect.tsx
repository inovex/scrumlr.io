import queryString from "query-string";
import {useEffect} from "react";
import {API} from "../../api";

function AuthRedirect() {
  useEffect(() => {
    const url = location.search;
    const params = queryString.parse(url);

    if (params.error) {
      // TODO show error
    }

    if (params.code) {
      API.verifyGoogleSignIn(params.code as string).then((res) => {
        const user = new Parse.User();
        const authData = {
          id: res.id,
          access_token: res.accessToken,
        };

        user.linkWith("google", {authData}).then(() => {
          user.set("username", res.name);
          user.save();
        });
      });
    }
  }, []);

  return <div>Test</div>;
}

export default AuthRedirect;
