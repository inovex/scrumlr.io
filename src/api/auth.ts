import {SERVER_URL} from "../config";

export const AuthAPI = {
  signOut: async () => {
    try {
      await fetch(`${SERVER_URL}/login`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      throw new Error(`unable to sign out with error: ${error}`);
    }
  },

  signInAnonymously: async (name: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/login/anonymous`, {
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
};
