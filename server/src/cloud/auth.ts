import {google} from "googleapis";
import axios from "axios";
import qs from "qs";
import {publicApi} from "./util";

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
  /**
   * GOOGLE OAuth
   * */
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && AUTH_REDIRECT_URI) {
    // https://github.com/autodidaktum/google-oauth2-parse-react/blob/master/deploy/cloud/main.js
    publicApi<{state: string}, string>("GoogleSignIn", async ({state}) => {
      const oauth2Client = getGoogleOAuth2Client();

      // returns the login link
      return oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["openid", "profile"],
        state,
      });
    });

    publicApi<{code: string}, UserInformation>("GoogleVerifySignIn", async ({code}) => {
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

  /**
   * GITHUB OAuth
   * */
  if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET && AUTH_REDIRECT_URI) {
    publicApi<{state: string}, string>(
      "GithubSignIn",
      async ({state}) => `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user&state=${state}&redirect_uri=${encodeURI(AUTH_REDIRECT_URI)}`
    );

    publicApi<{code: string}, UserInformation>("GithubVerifySignIn", async ({code}) => {
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

  /**
   * MICROSOFT OAuth
   * */
  if (MICROSOFT_CLIENT_ID && MICROSOFT_CLIENT_SECRET && AUTH_REDIRECT_URI) {
    publicApi<{state: string}, string>(
      "MicrosoftSignIn",
      async ({state}) =>
        `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&response_type=code&redirect_uri=${encodeURI(
          AUTH_REDIRECT_URI
        )}&response_mode=query&scope=User.Read&state=${state}`
    );

    publicApi<{code: string}, UserInformation>("MicrosoftVerifySignIn", async ({code}) => {
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
      return {
        id: user.data.id,
        name: user.data.displayName,
        accessToken,
        photoURL: "",
      };
    });
  }
};
