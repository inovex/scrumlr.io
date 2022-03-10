import {SERVER_URL} from "../config";

export const InfoAPI = {
  getServerInfo: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/info`);

      if (response.status === 200) {
        return (await response.json()) as {authProvider: string[]; serverTime: string};
      }

      throw new Error(`responded with status code ${response.status}`);
    } catch (error) {
      throw new Error(`unable to fetch current user: ${error}`);
    }
  },
};
