import {Toast} from "utils/toast";
import {API} from "api";
import i18n from "i18next";
import store from "store";
import {Actions} from "store/action";
import {SERVER_HTTP_URL} from "../config";

/**
 * Sign in anonymously.
 *
 * @param displayName Display name of the parse auth user.
 *
 * @returns Promise with user credentials on successful sign in, null otherwise.
 */
const signInAnonymously = async (displayName: string) => {
  try {
    const user = await API.signInAnonymously(displayName);
    if (user) {
      store.dispatch(Actions.signIn(user.id, user.name));
    }
    return true;
  } catch (err) {
    Toast.error({title: i18n.t("Toast.authenticationError")});
    return null;
  }
};

/**
 * Redirects to OAuth page of provider:
 *    https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount...
 *    https://github.com/login/oauth/authorize...
 *    https://login.microsoftonline.com/common/oauth2/v2.0/authorize...
 * @param authProvider name of the OAuth Provider
 * @param originURL origin URL
 */
const signInWithAuthProvider = async (authProvider: string, originURL: string) => {
  window.location.href = `${SERVER_HTTP_URL}/login/${authProvider}?state=${encodeURIComponent(originURL)}`;
};

export const Auth = {
  signInAnonymously,
  signInWithAuthProvider,
};
