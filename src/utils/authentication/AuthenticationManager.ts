import Parse from "parse";
import {Toast} from "utils/Toast";
import {API} from "api";
import i18n from "i18next";

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
    Toast.error(i18n.t("Toast.authenticationError"));
    return null;
  }
};

/**
 * Redirects to OAuth page of provider:
 *    https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount...
 *    https://github.com/login/oauth/authorize...
 *    https://login.microsoftonline.com/common/oauth2/v2.0/authorize..
 * @param authProvider name of the OAuth Provider
 * @param originURL origin URL
 */
const signInWithAuthProvider = async (authProvider: string, originURL: string) => {
  window.location.href = await API.signIn(authProvider, originURL);
};

export const AuthenticationManager = {
  signInAnonymously,
  signInWithAuthProvider,
};
