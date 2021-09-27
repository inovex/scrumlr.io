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
   * Sign in with authentication provider: google, github, microsoft or apple.
   *
   * @returns the redirection URL
   */
  signIn: (authProvider: string) => callAPI<{state: string}, string>(`${authProvider}SignIn`, {state: generateState(authProvider)}),

  /**
   * Verify the sign in with the OAuth provider by the specified code.
   *
   * @param code the verification code returned by the authentication provider
   * @param state the state passed by the authentication provider (see https://auth0.com/docs/protocols/state-parameters)
   * @param authProvider name of the chosen OAuth provider. Used for adressing the correct endpoint
   *
   * @returns user information and redirect URL
   */
  verifySignIn: async (code: string, state: string, authProvider: string) => {
    // check if state is available in storage and execute call on match
    let redirectURL;
    if (sessionStorage.getItem("boardId")) {
      redirectURL = sessionStorage.getItem("boardId");
    } else {
      redirectURL = sessionStorage.getItem(state);
    }
    sessionStorage.clear();
    if (redirectURL) {
      const user = await callAPI<{code: string}, {id: string; name: string; accessToken: string; idToken: string}>(`${authProvider}VerifySignIn`, {code});
      return {
        user,
        redirectURL,
      };
    }
    throw new Error("state does not match");
  },
};
