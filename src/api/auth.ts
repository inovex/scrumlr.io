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
  signOut: async () => {
    await fetch("http://localhost:8080/login", {
      method: "DELETE",
      credentials: "include",
    });
    return true;
  },

  signInAnonymously: async (name: string) => {
    const response = await fetch("http://localhost:8080/login/anonymous", {
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
    return undefined;
  },
};
