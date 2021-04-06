import {callAPI} from "./index";

export const AuthAPI = {
  signInWithGoogle: (origin: string) => {
    return callAPI<{origin: string}, string>("GoogleSignIn", {origin});
  },

  verifyGoogleSignIn: (code: string) => {
    return callAPI<{code: string}, {id: string; name: string; accessToken: string; idToken: string}>("GoogleToken", {code});
  },
};
