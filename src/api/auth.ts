import {callAPI} from "./index";

export const AuthAPI = {
  /**
   * Sign in with Google.
   *
   * @param origin the URL origin of the color, usually defined by `window.location.href`
   *
   * @returns the redirection URL
   */
  signInWithGoogle: (origin: string) => {
    return callAPI<{origin: string}, string>("GoogleSignIn", {origin});
  },

  /**
   * Verify the sign in with Google by the specified code.
   *
   * @param code the verification code returned by the authentication provider
   *
   * @returns the user information
   */
  verifyGoogleSignIn: (code: string) => {
    return callAPI<{code: string}, {id: string; name: string; accessToken: string; idToken: string}>("GoogleVerifySignIn", {code});
  },
};
