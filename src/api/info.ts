import {SERVER_URL} from "../config";

export const InfoAPI = {
  getServerInfo: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/info`);

      if (response.status === 200) {
        return (await response.json()) as {authProvider: string[]};
      }
    } catch (error) {
      throw new Error(`unable to fetch current user: ${error}`);
    }

    return undefined;
  },
};
