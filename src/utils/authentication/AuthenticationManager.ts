import Parse from "parse";
import {Toast} from "../Toast";

/**
 * Sign in anonymously.
 *
 * @param displayName Display name of the parse auth user.
 * @param photoURL Profile photo URL of the parse auth user.
 *
 * @returns Promise with user credentials on successful sign in, null otherwise.
 */
async function signInAnonymously(displayName?: string, photoURL?: string) {
  try {
    const user = new Parse.User();
    user.set("displayName", displayName);
    user.set("photoURL", photoURL);
    return await user.linkWith("anonymous", {authData: undefined});
  } catch (err) {
    Toast.error("There occurred a problem while signing you in");
    return null;
  }
}

export const AuthenticationManager = {
  signInAnonymously,
};
