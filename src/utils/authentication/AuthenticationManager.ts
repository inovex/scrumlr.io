import Parse from "parse";
import {Toast} from "../Toast";
import {API} from "../../api";

/**
 * Sign in anonymously.
 *
 * @param displayName Display name of the parse auth user.
 * @param photoURL Profile photo URL of the parse auth user.
 *
 * @returns Promise with user credentials on successful sign in, null otherwise.
 */
const signInAnonymously = async (displayName?: string, photoURL?: string) => {
  try {
    const user = new Parse.User();
    user.set("displayName", displayName);
    user.set("photoURL", photoURL);
    return await user.linkWith("anonymous", {authData: undefined});
  } catch (err) {
    Toast.error("There occurred a problem while signing you in");
    return null;
  }
};

/**
 * Redirects to OAuth page of provider
 *
 * @param authProvider name of the OAuth Provider
 */
const signInWithAuthProvider = async (authProvider: string) => {
  window.location.href = await API.signIn(authProvider);
  // redirectURI: https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount...
  // redirectURI: https://github.com/login/oauth/authorize...
  // redirectURI https://login.microsoftonline.com/common/oauth2/v2.0/authorize..
};

export const AuthenticationManager = {
  signInAnonymously,
  signInWithAuthProvider,
};
