import {v4 as uuidv4} from "uuid";
import {callAPI} from "api/callApi";

const generateState = (prefix: string, originURL: string) => {
  // generate random state id and store origin into the session storage
  const state = `${prefix}-${uuidv4()}`;
  sessionStorage.setItem(state, originURL);
  return state;
};

/* TODO: use or delete after deployment
 * this is how user looks like in first apple response
export interface IAppleUser {
  name: {
    firstName: string;
    lastName: string;
  };
  email: string;
}
 */

export const AuthAPI = {
  /**
   * Sign in with authentication provider: google, github, microsoft or apple.
   *
   * @returns the redirection URL
   */
  signIn: (authProvider: string, originURL: string) => callAPI<{state: string}, string>(`${authProvider}SignIn`, {state: generateState(authProvider, originURL)}),

  /**
   * Verify the sign in with the OAuth provider by the specified code.
   *
   * @param code the verification code returned by the authentication provider
   * @param state the state passed by the authentication provider (see https://auth0.com/docs/protocols/state-parameters)
   * @param authProvider name of the chosen OAuth provider. Used for adressing the correct endpoint
   * @returns user information and redirect URL
   */
  // @param appleUser only given when signing in with apple for the first time
  // after deployment for apple user name handling: verifySignIn: async (code: string, state: string, authProvider: string, appleUser: string) => {
  verifySignIn: async (code: string, state: string, authProvider: string) => {
    // check if state is available in storage and execute call on match

    const redirectURL = sessionStorage.getItem(state);

    if (redirectURL) {
      // after deployment for apple user name handling: const user =
      // await callAPI<{code: string; appleUser: string}, {id: string; name: string; accessToken: string; idToken: string}>(`${authProvider}VerifySignIn`, {code,appleUser});
      const user = await callAPI<{code: string}, {id: string; name: string; accessToken: string; idToken: string}>(`${authProvider}VerifySignIn`, {
        code,
      });
      return {
        user,
        redirectURL,
      };
    }

    throw new Error("state does not match");
  },
};
