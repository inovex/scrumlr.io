import {Request} from "types/request";
import {SERVER_URL} from "../config";

export const RequestAPI = {
  acceptJoinRequest: async (boardId: string, userId: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/boards/${boardId}/requests/${userId}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({status: "ACCEPTED"}),
      });

      if (response.status === 200) {
        return (await response.json()) as Request;
      }

      throw new Error(`request update resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update join request: ${error}`);
    }
  },

  rejectJoinRequest: async (boardId: string, userId: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/boards/${boardId}/requests/${userId}`, {
        method: "PUT",
        credentials: "include",
        body: JSON.stringify({status: "REJECTED"}),
      });

      if (response.status === 200) {
        return (await response.json()) as Request;
      }

      throw new Error(`request update resulted in response status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to update join request: ${error}`);
    }
  },
};
