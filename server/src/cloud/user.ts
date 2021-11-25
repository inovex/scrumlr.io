import {StatusResponse} from "types";
import {UserConfigurations} from "types/user";
import {requireValidBoardMember} from "./permission";
import {api} from "./util";

/**
 * @param showHiddenColumns Allows moderators to toggle the display of hidden columns (visible only to themselves)
 */
type EditUserConfigurationRequest = {
  boardId: string;
  userConfiguration: {
    userId?: string;
    showHiddenColumns?: boolean;
  };
};

type SetUserReadyStateRequest = {
  boardId: string;
  ready: boolean;
};

type SetUsersRaisedHandRequest = {
  boardId: string;
  configuration: {
    userId: string[];
    raisedHand: boolean;
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

    const id = request.userConfiguration.userId ?? user.id;

    const userConfigurations: UserConfigurations = await board.get("userConfigurations");

    if (request.userConfiguration.showHiddenColumns != undefined) {
      userConfigurations[id] = {...userConfigurations[id], showHiddenColumns: request.userConfiguration.showHiddenColumns};
    }

    board.set("userConfigurations", userConfigurations);
    await board.save(null, {useMasterKey: true});
    return {status: "Success", description: "User configuration edited."};
  });

  api<SetUserReadyStateRequest, StatusResponse>("setReadyStatus", async (user, request) => {
    await requireValidBoardMember(user, request.boardId);

    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});
    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.boardId}' does not exist`};
    }

    if (request.ready) {
      board.addUnique("usersMarkedReady", user.id);
    } else {
      board.remove("usersMarkedReady", user.id);
    }

    await board.save(null, {useMasterKey: true});
    return {status: "Success", description: "User ready state set."};
  });

  api<SetUsersRaisedHandRequest, StatusResponse>("setRaisedHandStatus", async (user, request) => {
    await requireValidBoardMember(user, request.boardId);

    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});
    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.boardId}' does not exist`};
    }

    if (request.configuration.raisedHand) {
      request.configuration.userId.forEach((id) => {
        board.addUnique("usersRaisedHands", id);
      });
    } else {
      request.configuration.userId.forEach((id) => {
        board.remove("usersRaisedHands", id);
      });
    }

    await board.save(null, {useMasterKey: true});
    return {status: "Success", description: "User raised hand state set."};
  });
};
