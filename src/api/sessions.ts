import {Session} from "store/features";
import {SERVER_HTTP_URL} from "config";

export const SessionsAPI = {
  getSessions: async () => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/sessions`, {
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
};
