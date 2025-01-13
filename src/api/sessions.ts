import {Session} from "store/features";
import {SERVER_HTTP_URL} from "config";

export const SessionsAPI = {
  getSessions: async () => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        return ((await response.json()) as Session[]) ?? [];
      }

      throw new Error(`get all sessions request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get all sessions with error: ${error}`);
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/sessions/${sessionId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 204) {
        return;
      }

      throw new Error(`get all templates request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to get all templates with error: ${error}`);
    }
  },
};
