import {google} from "googleapis";
import {publicApi} from "./util";

const {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI} = process.env;

const getGoogleOAuth2Client = () => {
  const {OAuth2} = google.auth;
  return new OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
};

export interface UserInformation {
  id: string;
  name: string;
  idToken: string;
  accessToken: string;
  photoURL: string;
}

export const initializeAuthFunctions = (): void => {
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REDIRECT_URI) {
    console.log("Initializing auth API for provider Google");

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
};
