import {callAPI} from "./index";

const generateState = (prefix: string) => {
  // generate random state id and store origin into the session storage
  const state = `${prefix}-${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
  sessionStorage.setItem(state, window.location.href);
  return state;
};

export const AuthAPI = {
  /**
   * Sign in with Google.
   *
   * @returns the redirection URL
   */
  signInWithGoogle: () => callAPI<{state: string}, string>("GoogleSignIn", {state: generateState("google")}),

  signInWithGithub: () => callAPI<{state: string}, string>("GithubSignIn", {state: generateState("github")}),

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

  /**
   * Verify the sign in with Google by the specified code.
   *
   * @param code the verification code returned by the authentication provider
   * @param state the state passed by the authentication provider (see https://auth0.com/docs/protocols/state-parameters)
   *
   * @returns the user information
   */
  verifyGithubSignIn: async (code: string, state: string) => {
    // check if state is available in storage and execute call on match
    const redirectURL = sessionStorage.getItem(state);
    if (redirectURL) {
      const user = await callAPI<{code: string}, {id: string; name: string; accessToken: string}>("GithubVerifySignIn", {code});
      return {
        user,
        redirectURL,
      };
    }
    throw new Error("state does not match");
  },
};
