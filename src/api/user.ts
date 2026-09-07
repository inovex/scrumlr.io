import {Auth} from "store/features/auth/types";
import {buildUrl} from "./index";

export const UserAPI = {
  /**
   * Get the logged in user
   *
   * @returns logged in user
   */
  getUser: async (): Promise<Auth> => {
    try {
      const url = buildUrl(`./users`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Auth;
      }

      throw new Error(`unable to fetch user with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to fetch user`, {cause: error});
    }
  },

  /**
   * Get a user
   *
   * @param userId user id
   *
   * @returns requested user
   */
  getUserById: async (userId: string): Promise<Auth> => {
    try {
      const url = buildUrl(`./users/${userId}`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Auth;
      }

      throw new Error(`unable to fetch user with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to fetch user`, {cause: error});
    }
  },

  /**
   * Get users on a board
   *
   * @param boardID board id
   *
   * @returns users on the board
   */
  getUsers: async (boardID: string): Promise<Auth[]> => {
    try {
      const url = buildUrl(`./users/board/${boardID}`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Auth[];
      }
      throw new Error(`unable to fetch all users with response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to fetch all users`, {cause: error});
    }
  },

  /**
   * Edits a user.
   *
   * @param user the updated user object
   *
   * @returns update user
   */
  editUser: async (user: Auth): Promise<Auth> => {
    try {
      const url = buildUrl(`./users`);
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
        return (await response.json()) as Auth;
      }

      throw new Error(`request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update user`, {cause: error});
    }
  },

  /**
   * Deletes a user.
   *
   * @param userId the id of the user to delete
   */
  deleteUser: async (userId: string) => {
    try {
      const url = buildUrl(`./users/${userId}`);
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 204) {
        return;
      }

      throw new Error(`request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to delete user`, {cause: error});
    }
  },
};
