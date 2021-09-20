import {requireValidBoardMember} from "./permission";
import {api} from "./util";

/**
 * @param showHiddenColumns Allows moderators to toggle the display of hidden columns (visible only to themselves)
 * @param showHiddenNotes Allows moderators to toggle the display of hidden columns (visible only to themselves)
 */
type EditUserConfigurationRequest = {
  userId: string;
  boardId: string;
  editUserConfigurationRequest: {
    showHiddenColumns: boolean;
    showHiddenNotes: boolean;
  };
};

export const initializeUserFunctions = () => {
  /**
   * Allows users to configure their settings.
   */
  api<EditUserConfigurationRequest, {status: string; description: string}>("editUserConfiguration", async (user, request) => {
    await requireValidBoardMember(user, request.boardId);

    if (request.editUserConfigurationRequest.showHiddenColumns !== undefined) {
      user.set("showHiddenColumns", request.editUserConfigurationRequest.showHiddenColumns);
    }

    if (request.editUserConfigurationRequest.showHiddenNotes !== undefined) {
      user.set("showHiddenNotes", request.editUserConfigurationRequest.showHiddenNotes);
    }

    user.save(null, {useMasterKey: true});

    return {status: "Success", description: "User was successfully removed from the list of moderators"};
  });
};
