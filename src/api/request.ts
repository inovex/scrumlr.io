import {JoinRequestStatusType, Request} from "store/features/requests/types";
import {buildUrl} from "./index";

export const RequestAPI = {
  /**
   * Get all session request for a board
   *
   * @param boardId board id
   *
   * @returns all session reuqests for a board
   */
  getRequests: async (boardId: string, status: JoinRequestStatusType | null = null): Promise<Request[]> => {
    try {
      const url = buildUrl(`./boards/${boardId}/requests`, [{key: "status", value: status}]);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Request[];
      }

      throw new Error(`get session requests resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get session requests`, {cause: error});
    }
  },

  /**
   * Get a session request for a board and a user
   *
   * @param boardId board id
   * @param userId user id
   *
   * @returns a session request for a user and board
   */
  getRequest: async (boardId: string, userId: string): Promise<Request> => {
    try {
      const url = buildUrl(`./boards/${boardId}/requests/${userId}`);
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return (await response.json()) as Request;
      }

      throw new Error(`get session request resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get session request`, {cause: error});
    }
  },

  /**
   * Accept a user to join a board
   *
   * @param boardId board id
   * @param userId user id
   *
   * @returns accepted session request
   */
  acceptJoinRequest: async (boardId: string, userId: string): Promise<Request> => {
    try {
      const url = buildUrl(`./boards/${boardId}/requests/${userId}`);
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({status: "ACCEPTED"}),
      });

      if (response.status === 200) {
        return (await response.json()) as Request;
      }

      throw new Error(`request update resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to accept join request`, {cause: error});
    }
  },

  /**
   * Reject a user to join a board
   *
   * @param boardId board id
   * @param userId user id
   *
   * @returns rejected session request
   */
  rejectJoinRequest: async (boardId: string, userId: string): Promise<Request> => {
    try {
      const url = buildUrl(`./boards/${boardId}/requests/${userId}`);
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({status: "REJECTED"}),
      });

      if (response.status === 200) {
        return (await response.json()) as Request;
      }

      throw new Error(`request update resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to reject join request`, {cause: error});
    }
  },
};
