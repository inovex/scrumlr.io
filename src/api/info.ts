import {SERVER_URL} from "../config";

interface ServerInformation {
  authProvider: string[];
  serverTime: string;
}

export const InfoAPI = {
  /**
   * Returns the server configuration and information.
   *
   * The server information can be used to e.g. set the available authentication providers or
   * to calculate the time offset of the client.
   *
   * @returns the server configuration
   */
  getServerInfo: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/info`);

      if (response.status === 200) {
        return (await response.json()) as ServerInformation;
      }

      throw new Error(`responded with status code ${response.status}`);
    } catch (error) {
      throw new Error(`unable to fetch current user: ${error}`);
    }
  },
};
