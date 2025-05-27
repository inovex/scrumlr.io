import {SERVER_HTTP_URL} from "../config";
import {AuthDto} from "../store/features/auth/types";

export const AuthAPI = {
  /**
   * Signs out the current user by deleting the session cookie.
   *
   * Since the session cookie is set to http only it cannot be accessed by the client. Therefore
   * a call to the server is required.
   */
  signOut: async () => {
    try {
      await fetch(`${SERVER_HTTP_URL}/login`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      throw new Error(`unable to sign out with error: ${error}`);
    }
  },

  /**
   * Sign in by an anonymous account with the specified username.
   *
   * @param name the username of the account
   */
  signInAnonymously: async (name: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/login/anonymous`, {
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
      throw new Error(`unable to sign in with error: ${error}`);
    }
  },

  /**
   * Returns the current user or `undefined`, if no session is available.
   *
   * @returns the user or `undefined`
   */
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/user`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as AuthDto;
      }
    } catch (error) {
      throw new Error(`unable to fetch current user: ${error}`);
    }

    return undefined;
  },
};
