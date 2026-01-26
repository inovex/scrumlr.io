import {Auth} from "store/features/auth/types";
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
      const response = await fetch(`${SERVER_HTTP_URL}/users/`, {
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

  /**
   * Deletes a user.
   *
   * @param userId the ID of the user to delete
   * @returns void
   */
  deleteUser: async (userId: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 204) {
        return;
      }

      throw new Error(`request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to delete user: ${error}`);
    }
  },

  getUserById: async (userId: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/users/${userId}`, {
        method: "GET",
        credentials: "include",
      });
      if (response.status === 200) {
        return (await response.json()) as Auth;
      }
      throw new Error(`unable to fetch user with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to fetch user: ${error}`);
    }
  },

  getUsers: async (boardID: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/users/board/${boardID}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Auth[];
      }
      throw new Error(`unable to fetch user with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to fetch user: ${error}`);
    }
  },
};
