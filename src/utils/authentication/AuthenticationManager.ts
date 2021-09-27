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

const onGoogleSignIn = async () => {
  window.location.href = await API.signInWithGoogle(); // redirectURI: https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount...
};

const onGithubSignIn = async () => {
  window.location.href = await API.signInWithGithub(); // redirectURI: https://github.com/login/oauth/authorize...
};

const onMicrosoftSignIn = async () => {
  window.location.href = await API.signInWithMicrosoft(); // redirectURI https://login.microsoftonline.com/common/oauth2/v2.0/authorize..
};

export const AuthenticationManager = {
  signInAnonymously,
  onGoogleSignIn,
  onGithubSignIn,
  onMicrosoftSignIn,
};
