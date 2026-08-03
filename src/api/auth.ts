import {AuthDto} from "../store/features/auth/types";
import {buildUrl} from "./index";

export const AuthAPI = {
  /**
   * Signs out the current user by deleting the session cookie.
   *
   * Since the session cookie is set to http only it cannot be accessed by the client. Therefore
   * a call to the server is required.
   */
  signOut: async () => {
    const url = buildUrl(`/login`);
    try {
      await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      throw new Error(`unable to sign out`, {cause: error});
    }
  },

  /**
   * Sign in by an anonymous account with the specified username.
   *
   * @param name the username of the account
   */
  signInAnonymously: async (name: string) => {
    const url = buildUrl(`/login/anonymous`);
    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({name}),
      });

      if (response.status === 201) {
        const body = await response.json();
        return {
          id: body.id,
          name: body.name,
        };
      }

      throw new Error(`sign in request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to sign in`, {cause: error});
    }
  },

  /**
   * Returns the current user or `undefined`, if no session is available.
   *
   * @returns the user or `undefined`
   */
  getCurrentUser: async () => {
    const url = buildUrl(`/users`);
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as AuthDto;
      }
    } catch (error) {
      throw new Error(`unable to fetch current user`, {cause: error});
    }

    return undefined;
  },
};
