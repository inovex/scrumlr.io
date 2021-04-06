import {api, publicApi} from "./util";
import {google} from 'googleapis';

const getGoogleOAuth2Client = () => {
    const OAuth2 = google.auth.OAuth2;
    return new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
}

export interface TokenRequest {
    error?: string;
    code?: string;
}

export interface UserInformation {
    id: string;
    name: string;
    email: string;
    idToken: string;
    accessToken: string;
    picture: string;
}

export const initializeAuthFunctions = () => {
    // https://github.com/autodidaktum/google-oauth2-parse-react/blob/master/deploy/cloud/main.js
    publicApi<{ origin: string }, string>('GoogleSignIn', async (request: {  origin: string }) => {
        const oauth2Client = getGoogleOAuth2Client();

        // returns the login link
        return oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: ["openid", "profile"],
            state: encodeURI(origin)
        });
    });

    publicApi<TokenRequest, UserInformation>('GoogleToken', async (request) => {
        const oauth2Client = getGoogleOAuth2Client();

        if (request.error) {
            throw new Error(request.error);
        } else {
            const { tokens } = await oauth2Client.getToken(request.code);
            oauth2Client.setCredentials(tokens);
            const oauth2 = google.oauth2({
                auth: oauth2Client,
                version: "v2",
            });
            const user = await oauth2.userinfo.get();
            return {
                id: user.data.id,
                email: user.data.email,
                name: user.data.name,
                picture: user.data.picture,
                idToken: tokens.id_token,
                accessToken: tokens.access_token,
            };
        }
    });
}