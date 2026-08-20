import {ServerInfo} from "store/features";
import {buildUrl} from "./index";

// type as received from the backend
interface ServerInformationDto {
  anonymousLoginDisabled: boolean;
  authProvider: string[];
  serverTime: string;
  feedbackEnabled: boolean;
  allowAnonymousCustomTemplates: boolean;
  allowAnonymousBoardCreation: boolean;
  allowAnonymousHistory: boolean;
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
  getServerInfo: async (): Promise<ServerInfo> => {
    try {
      const url = buildUrl(`./info`);
      const response = await fetch(url);

      if (response.status === 200) {
        const info = (await response.json()) as ServerInformationDto;
        // convert to frontend type, don't ask me why they're different in the first place though
        return {
          serverTime: new Date(info.serverTime).getTime(),
          enabledAuthProvider: info.authProvider,
          anonymousLoginDisabled: info.anonymousLoginDisabled,
          allowAnonymousCustomTemplates: info.allowAnonymousCustomTemplates,
          allowAnonymousBoardCreation: info.allowAnonymousBoardCreation,
          allowAnonymousHistory: info.allowAnonymousHistory,
          feedbackEnabled: info.feedbackEnabled,
        } as ServerInfo;
      }

      throw new Error(`responded with status code ${response.status}`);
    } catch (error) {
      throw new Error(`unable to fetch server info`, {cause: error});
    }
  },
};
