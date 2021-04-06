import {callAPI} from "./index";

export const AuthAPI = {

    signInWithGoogle: (origin: string) => {
        return callAPI<{ origin: string }, string>('GoogleSignIn', { origin });
    },

    verifyGoogleSignIn: (code: string) => {
        return callAPI<{ code: string }, {}>('GoogleToken', { code: string });
    }
}