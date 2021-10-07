import {StatusResponse} from "types";
import {UserConfigurations} from "types/user";
import {requireValidBoardAdmin, requireValidBoardMember} from "./permission";
import {api} from "./util";

/**
 * @param showHiddenColumns Allows moderators to toggle the display of hidden columns (visible only to themselves)
 */
type EditUserConfigurationRequest = {
  boardId: string;
  userConfiguration: {
    showHiddenColumns?: boolean;
  };
};

export const initializeUserFunctions = () => {
  /**
   * Allows users to configure their settings.
   */
  api<EditUserConfigurationRequest, StatusResponse>("editUserConfiguration", async (user, request) => {
    await requireValidBoardMember(user, request.boardId);

    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});
    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.boardId}' does not exist`};
    }

    const userConfigurations: UserConfigurations = await board.get("userConfigurations");

    if (request.userConfiguration.showHiddenColumns != undefined) {
      userConfigurations[user.id] = {...userConfigurations[user.id], showHiddenColumns: request.userConfiguration.showHiddenColumns};
    }

    board.set("userConfigurations", userConfigurations);
    await board.save(null, {useMasterKey: true});
    return {status: "Success", description: "User configuration edited."};
  });
};
