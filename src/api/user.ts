import {Auth} from "store/features/auth/auth";
import {SERVER_HTTP_URL} from "../config";

export const UserAPI = {
  /**
   * Edits a user.
   *
   * @param user the updated user object
   * @returns a {status, description} object
   */
  editUser: async (user: Auth) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/user/`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
        return (await response.json()) as Auth;
      }

      throw new Error(`request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update user: ${error}`);
    }
  },
};
