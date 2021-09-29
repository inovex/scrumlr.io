import {StatusResponse} from "types";
import {requireValidBoardAdmin, requireValidBoardMember} from "./permission";
import {api} from "./util";

/**
 * @param showHiddenColumns Allows moderators to toggle the display of hidden columns (visible only to themselves)
 */
type EditUserConfigurationRequest = {
  userId: string;
  boardId: string;
  userConfiguration: {
    showHiddenColumns: boolean;
  };
};

export const initializeUserFunctions = () => {
  /**
   * Allows users to configure their settings.
   */
  api<EditUserConfigurationRequest, StatusResponse>("editUserConfiguration", async (user, request) => {
    await requireValidBoardMember(user, request.boardId);

    if (request.userConfiguration.showHiddenColumns != undefined) {
      await requireValidBoardAdmin(user, request.boardId);
      user.set("showHiddenColumns", request.userConfiguration.showHiddenColumns);
    }

    user.save(null, {useMasterKey: true});

    return {status: "Success", description: "User configuration edited."};
  });
};
