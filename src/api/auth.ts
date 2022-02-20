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
