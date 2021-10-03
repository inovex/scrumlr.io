import {google} from "googleapis";
import axios from "axios";
import qs from "qs";
import jwt from "jsonwebtoken";
import fs from "fs";
import {publicApi} from "./util";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET,
  APPLE_CLIENT_ID,
  APPLE_CLIENT_SECRET,
  APPLE_PRIVATE_KEY_FILE_PATH,
  APPLE_KEY_ID,
  APPLE_TEAM_ID,
  AUTH_REDIRECT_URI,
} = process.env;

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
    publicApi<{state: string}, string>("googleSignIn", async ({state}) => {
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
    publicApi<{code: string}, UserInformation>("googleVerifySignIn", async ({code}) => {
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
    publicApi<{state: string}, string>("githubSignIn", async ({state}) => {
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
    publicApi<{code: string}, UserInformation>("githubVerifySignIn", async ({code}) => {
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
    publicApi<{state: string}, string>("microsoftSignIn", async ({state}) => {
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
    publicApi<{code: string}, UserInformation>("microsoftVerifySignIn", async ({code}) => {
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

  // TODO: Test in deployed scrumlr, because the following code can not be used/tested with localhost and is only preparatory
  if (APPLE_CLIENT_ID && APPLE_CLIENT_SECRET && AUTH_REDIRECT_URI) {
    /**
     * Function generates consent page URL where the code is retrieved
     * https://medium.com/identity-beyond-borders/sign-in-with-apple-a-zero-code-change-approach-54b44d59f60c
     */
    publicApi<{state: string}, string>("appleSignIn", async ({state}) => {
      const url = new URL("/auth/authorize", "https://appleid.apple.com");
      url.searchParams.append("response_type", "code");
      url.searchParams.append("redirect_uri", AUTH_REDIRECT_URI);
      url.searchParams.append("state", state);
      url.searchParams.append("client_id", APPLE_CLIENT_ID);
      url.searchParams.append("scope", "name email");
      url.searchParams.append("response_mode", "form_post"); // response_mode must be form_post when name or email scope is requested.
      return url.toString();
    });

    /**
     * 0) JWT Generation as client_secret
     * 1) Function exchanges code for access_token and id_token (holds user id)
     * https://developer.okta.com/blog/2019/06/04/what-the-heck-is-sign-in-with-apple
     * https://developer.apple.com/documentation/sign_in_with_apple/generate_and_validate_tokens
     * https://medium.com/techulus/how-to-setup-sign-in-with-apple-9e142ce498d4
     * https://sarunw.com/posts/sign-in-with-apple-4/
     * user information is only available on first contact: https://developer.apple.com/forums/thread/127677
     */
    publicApi<{code: string; appleUser: string}, UserInformation>("appleVerifySignIn", async ({code, appleUser}) => {
      const getClientSecret = async (): Promise<string> => {
        const privateKey = fs.readFileSync(APPLE_PRIVATE_KEY_FILE_PATH); // TODO: Download and include private key: https://help.apple.com/developer-account/#/devcdfbb56a3
        // 0) JWT Generation as client_secret
        const headers: jwt.JwtHeader = {
          kid: APPLE_KEY_ID,
          alg: "ES256",
        };
        const claims = {
          iss: APPLE_TEAM_ID,
          aud: "https://appleid.apple.com",
          sub: APPLE_CLIENT_ID,
        };
        const options: jwt.SignOptions = {
          algorithm: "ES256",
          header: headers,
          expiresIn: "24h",
        };
        return jwt.sign(claims, privateKey, options);
      };
      const clientSecret: string = await getClientSecret();

      // 1) Function exchanges code for access token.
      const postData = {
        client_id: APPLE_CLIENT_ID,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: AUTH_REDIRECT_URI,
      };
      const config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      const accessTokenRequest = await axios.post("https://appleid.apple.com/auth/token", qs.stringify(postData), config);
      const accessToken = accessTokenRequest.data.access_token;
      const idToken = accessTokenRequest.data.id_token;
      const user = JSON.parse(atob((idToken as string).split(".")[1]));

      // TODO: Find out if user name is only included in the same response that contains code as described here
      // https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/incorporating_sign_in_with_apple_into_other_platforms
      // https://developer.apple.com/forums/thread/127677
      // maybe other information is sent and can be used as name (e.g. email)
      let name;
      if (appleUser) {
        name = `${JSON.parse(appleUser).name.firstName} ${JSON.parse(appleUser).name.lastName}`;
      } else {
        const userNameQuery = new Parse.Query(Parse.User);
        userNameQuery.equalTo("username", user.sub);
      }
      return {
        id: user.sub,
        name,
        accessToken,
        photoURL: undefined,
      };
    });
  }
};
