import {google} from "googleapis";
import axios from "axios";
import qs from "qs";
import {authApi} from "./util";

const {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, AUTH_REDIRECT_URI, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET} = process.env;

const getGoogleOAuth2Client = () => {
  const {OAuth2} = google.auth;
  return new OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_REDIRECT_URI);
};

export interface UserInformation {
  id: string;
  name: string;
  idToken?: string;
  accessToken: string;
  photoURL: string;
}

export const initializeAuthFunctions = (): void => {
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && AUTH_REDIRECT_URI) {
    /**
     * Function generates consent page URL where the code is retrieved
     * github.com/autodidaktum/google-oauth2-parse-react/blob/master/deploy/cloud/main.js
     * https://www.npmjs.com/package/googleapis#oauth2-client
     */
    authApi<{state: string}, string>("googleSignIn", async ({state}) => {
      const oauth2Client = getGoogleOAuth2Client();
      return oauth2Client.generateAuthUrl({
        access_type: "offline", // gets refresh_token
        scope: ["openid", "profile"],
        state,
      });
    });

    /**
     * 1) Function exchanges the code for access token.
     * 2) Access token is used to retrieve user information.
     */
    authApi<{code: string}, UserInformation>("googleVerifySignIn", async ({code}) => {
      const oauth2Client = getGoogleOAuth2Client();
      const {tokens} = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: "v2",
      });
      const user = await oauth2.userinfo.get();
      return {
        id: user.data.id,
        name: user.data.name,
        idToken: tokens.id_token,
        accessToken: tokens.access_token,
        photoURL: user.data.picture,
      };
    });
  }

  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET && AUTH_REDIRECT_URI) {
    /**
     * Function generates consent page URL where the code is retrieved
     * https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps
     */
    authApi<{state: string}, string>("githubSignIn", async ({state}) => {
      const url = new URL("/login/oauth/authorize", "https://github.com");
      url.searchParams.append("client_id", GITHUB_CLIENT_ID);
      url.searchParams.append("scope", "user");
      url.searchParams.append("state", state);
      url.searchParams.append("redirect_uri", AUTH_REDIRECT_URI);
      return url.toString();
    });

    /**
     * 1) Function exchanges code for access token.
     * 2) Access token is used to retrieve user information.
     */
    authApi<{code: string}, UserInformation>("githubVerifySignIn", async ({code}) => {
      const accessTokenRequest = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
        },
        {headers: {Accept: "application/json"}}
      );
      const accessToken = accessTokenRequest.data.access_token;
      const user = await axios.get("https://api.github.com/user", {headers: {Authorization: `token ${accessToken}`, Accept: "application/json"}});
      return {
        id: user.data.id,
        name: user.data.login,
        accessToken,
        photoURL: user.data.avatar_url,
      };
    });
  }

  if (MICROSOFT_CLIENT_ID && MICROSOFT_CLIENT_SECRET && AUTH_REDIRECT_URI) {
    /**
     * Function generates consent page URL where the code is retrieved
     * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
     */
    authApi<{state: string}, string>("microsoftSignIn", async ({state}) => {
      const url = new URL("/common/oauth2/v2.0/authorize", "https://login.microsoftonline.com");
      url.searchParams.append("client_id", MICROSOFT_CLIENT_ID);
      url.searchParams.append("response_type", "code");
      url.searchParams.append("state", state);
      url.searchParams.append("scope", "User.Read");
      url.searchParams.append("response_mode", "query");
      url.searchParams.append("redirect_uri", AUTH_REDIRECT_URI);
      return url.toString();
    });

    /**
     * 1) Function exchanges code for access token.
     * 2) Access token is used to retrieve user information.
     */
    authApi<{code: string}, UserInformation>("microsoftVerifySignIn", async ({code}) => {
      const postData = {
        client_id: MICROSOFT_CLIENT_ID,
        scope: "User.Read",
        client_secret: MICROSOFT_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: AUTH_REDIRECT_URI,
        code,
      };
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      const accessTokenRequest = await axios.post(`https://login.microsoftonline.com/common/oauth2/v2.0/token`, qs.stringify(postData), config);
      const accessToken = accessTokenRequest.data.access_token;
      const user = await axios.get("https://graph.microsoft.com/v1.0/me", {headers: {Authorization: `Bearer ${accessToken}`, Accept: "application/json"}});
      // https://docs.microsoft.com/en-us/graph/api/profilephoto-get?view=graph-rest-1.0 -> photo retrieval not supported for personal account | otherwise admin rigths needed
      return {
        id: user.data.id,
        name: user.data.displayName,
        accessToken,
        photoURL: undefined,
      };
    });
  }
};
