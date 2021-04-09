import {callAPI} from "./index";

export const AuthAPI = {
  /**
   * Sign in with Google.
   *
   * @returns the redirection URL
   */
  signInWithGoogle: () => {
    // generate random state id and store origin into the session storage
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem(state, window.location.href);

    return callAPI<{state: string}, string>("GoogleSignIn", {state});
  },

  /**
   * Verify the sign in with Google by the specified code.
   *
   * @param code the verification code returned by the authentication provider
   * @param state the state passed by the authentication provider (see https://auth0.com/docs/protocols/state-parameters)
   *
   * @returns the user information
   */
  verifyGoogleSignIn: async (code: string, state: string) => {
    // check if state is available in storage and execute call on match
    const redirectURL = sessionStorage.getItem(state);
    if (redirectURL) {
      const user = await callAPI<{code: string}, {id: string; name: string; accessToken: string; idToken: string}>("GoogleVerifySignIn", {code});
      return {
        user,
        redirectURL,
      };
    }
    throw new Error("state does not match");
  },
};
