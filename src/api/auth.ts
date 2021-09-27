import {v4 as uuidv4} from "uuid";
import {callAPI} from "./callApi";

const generateState = (prefix: string) => {
  // generate random state id and store origin into the session storage
  const state = `${prefix}-${uuidv4()}`;
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

  /**
   * Verify the sign in with Google by the specified code.
   *
   * @param code the verification code returned by the authentication provider
   * @param state the state passed by the authentication provider (see https://auth0.com/docs/protocols/state-parameters)
   *
   * @returns user information and redirect URL
   */
  verifyGoogleSignIn: async (code: string, state: string) => {
    // check if state is available in storage and execute call on match
    let redirectURL;
    if (sessionStorage.getItem("boardId")) {
      redirectURL = sessionStorage.getItem("boardId");
    } else {
      redirectURL = sessionStorage.getItem(state);
    }
    sessionStorage.clear();
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
   * Sign in with GitHub.
   *
   * @returns the redirection URL
   */
  signInWithGithub: () => callAPI<{state: string}, string>("GithubSignIn", {state: generateState("github")}),

  /**
   * Verify the sign in with GitHub by the specified code.
   *
   * @param code the verification code returned by the authentication provider
   * @param state the state passed by the authentication provider (see https://auth0.com/docs/protocols/state-parameters)
   *
   * @returns user information and redirect URL
   */
  verifyGithubSignIn: async (code: string, state: string) => {
    // check if state is available in storage and execute call on match
    let redirectURL;
    if (sessionStorage.getItem("boardId")) {
      redirectURL = sessionStorage.getItem("boardId");
    } else {
      redirectURL = sessionStorage.getItem(state);
    }
    sessionStorage.clear();
    if (redirectURL) {
      const user = await callAPI<{code: string}, {id: string; name: string; accessToken: string}>("GithubVerifySignIn", {code});
      return {
        user,
        redirectURL,
      };
    }
    throw new Error("state does not match");
  },

  /**
   * Sign in with Microsoft.
   *
   * @returns the redirection URL
   */
  signInWithMicrosoft: () => callAPI<{state: string}, string>("MicrosoftSignIn", {state: generateState("microsoft")}),

  /**
   * Verify the sign in with Microsoft by the specified code.
   *
   * @param code the verification code returned by the authentication provider
   * @param state the state passed by the authentication provider (see https://auth0.com/docs/protocols/state-parameters)
   *
   * @returns user information and redirect URL
   */
  verifyMicrosoftSignIn: async (code: string, state: string) => {
    // check if state is available in storage and execute call on match
    let redirectURL;
    if (sessionStorage.getItem("boardId")) {
      redirectURL = sessionStorage.getItem("boardId");
    } else {
      redirectURL = sessionStorage.getItem(state);
    }
    sessionStorage.clear();
    if (redirectURL) {
      const user = await callAPI<{code: string}, {id: string; name: string; accessToken: string}>("MicrosoftVerifySignIn", {code});
      return {
        user,
        redirectURL,
      };
    }
    throw new Error("state does not match");
  },
};
