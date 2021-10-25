import {newObjectId} from "parse-server/lib/cryptoUtils";
import {StatusResponse} from "types";
import {UserConfigurations} from "types/user";
import * as crypto from "crypto";
import {getAdminRoleName, getMemberRoleName, isMember, isOnline, requireValidBoardAdmin} from "./permission";
import {api} from "./util";
import {serverConfig} from "../index";
import Color, {isOfTypeColor} from "../util/Color";

interface JoinBoardResponse {
  status: "accepted" | "passphrase_required" | "incorrect_passphrase" | "rejected" | "pending";
  joinRequestReference?: string;
}

const goOnline = (user: Parse.User, boardId: string) => {
  user.add("boards", boardId);
  user.save(null, {useMasterKey: true});
};

const goOffline = (user: Parse.User) => {
  user.unset("boards");
  user.save(null, {useMasterKey: true});
};

const addAsMember = async (user: Parse.User, boardId: string) => {
  const memberRoleQuery = new Parse.Query(Parse.Role);
  memberRoleQuery.equalTo("name", getMemberRoleName(boardId));

  const memberRole = await memberRoleQuery.first({useMasterKey: true});
  if (memberRole) {
    goOnline(user, boardId);
    memberRole.getUsers().add(user);
    return memberRole.save(null, {useMasterKey: true});
  }

  throw new Error(`No roles for board '${boardId}' found`);
};

const addToModerators = async (user: Parse.User, boardId: string) => {
  const adminRoleQuery = new Parse.Query(Parse.Role);
  adminRoleQuery.equalTo("name", getAdminRoleName(boardId));

  const adminRole = await adminRoleQuery.first({useMasterKey: true});
  if (adminRole) {
    adminRole.getUsers().add(user);
    return adminRole.save(null, {useMasterKey: true});
  }
  throw new Error(`No roles for board '${boardId}' found`);
};

const removeFromModerators = async (user: Parse.User, boardId: string) => {
  const adminRoleQuery = new Parse.Query(Parse.Role);
  adminRoleQuery.equalTo("name", getAdminRoleName(boardId));

  const adminRole = await adminRoleQuery.first({useMasterKey: true});
  if (adminRole) {
    adminRole.getUsers().remove(user);
    return adminRole.save(null, {useMasterKey: true});
  }
  throw new Error(`No roles for board '${boardId}' found`);
};

type AccessPolicy = {
  type: "Public" | "ByPassphrase" | "ManualVerification";
  passphrase?: string;
};

type AccessPolicyByPassphrase = AccessPolicy & {
  passphrase: string;
  salt: string;
};

const convertToAccessPolicyByPassphrase = (accessPolicy: AccessPolicy): AccessPolicyByPassphrase => {
  const salt = crypto.randomBytes(20).toString("hex");
  const passphrase = crypto
    .createHash("sha256")
    .update(accessPolicy.passphrase + salt)
    .digest("base64");

  return {
    type: accessPolicy.type,
    salt,
    passphrase,
  };
};

const respondToJoinRequest = async (currentUser: Parse.User, users: string[], board: string, manipulate: (object: Parse.Object) => void) => {
  await requireValidBoardAdmin(currentUser, board);

  const BoardClass = Parse.Object.extend("Board");
  const joinRequestQuery = new Parse.Query("JoinRequest");
  joinRequestQuery.equalTo("board", BoardClass.createWithoutData(board));
  joinRequestQuery.containedIn(
    "user",
    users.map((userId) => Parse.User.createWithoutData(userId))
  );

  joinRequestQuery.find({useMasterKey: true}).then(async (pendingJoinRequests) => {
    pendingJoinRequests.forEach(
      (joinRequest) => {
        manipulate(joinRequest);
      },
      {useMasterKey: true}
    );
    await Parse.Object.saveAll(pendingJoinRequests, {useMasterKey: true});
  });
};
export interface CreateBoardRequest {
  columns: {
    name: string;
    color: Color;
    hidden: boolean;
  }[];
  name?: string;
  encryptedContent?: boolean;
  accessPolicy: AccessPolicy;
}

export type EditableBoardAttributes = {
  name: string;
  showAuthors?: boolean;
  timerUTCEndTime?: Date;
  accessPolicy?: AccessPolicy;
  voting?: "active" | "disabled";
  votingIteration: number;
  showNotesOfOtherUsers: boolean;
  moderation?: {userId?: string; status: "active" | "disabled"};
};

export type EditBoardRequest = {id: string} & Partial<EditableBoardAttributes>;

export type DeleteBoardRequest = {boardId: string};

export interface JoinRequestResponse {
  board: string;
  users: string[];
}

export interface JoinBoardRequest {
  boardId: string;
  passphrase?: string;
}

export const initializeBoardFunctions = () => {
  (Parse.Cloud as any).onLiveQueryEvent(({event, sessionToken}) => {
    if (event === "connect" || event === "ws_disconnect") {
      const query = new Parse.Query<Parse.Object>("_Session");

      query.equalTo("sessionToken", sessionToken);
      query.first({useMasterKey: true}).then((session) => {
        const user = session.get("user");

        if (event === "ws_disconnect") {
          goOffline(user);
        }
      });
    }
  });

  api<CreateBoardRequest, string>("createBoard", async (user, request) => {
    const board = new Parse.Object("Board");
    const columns = request.columns.reduce((acc, current) => {
      if (!isOfTypeColor(current.color)) {
        throw new Error(`color ${current.color} is not allowed for columns`);
      }

      acc[newObjectId(serverConfig.objectIdSize)] = {
        name: current.name,
        color: current.color,
        hidden: current.hidden,
      };
      return acc;
    }, {});

    const userConfigurations: UserConfigurations = {};
    userConfigurations[user.id] = {showHiddenColumns: false};

    let {accessPolicy} = request;
    if (accessPolicy.type === "ByPassphrase") {
      accessPolicy = convertToAccessPolicyByPassphrase(accessPolicy);
    }

    const savedBoard = await board.save({...request, accessPolicy, columns, owner: user, userConfigurations}, {useMasterKey: true});

    const adminRoleACL = new Parse.ACL();
    adminRoleACL.setPublicReadAccess(false);
    adminRoleACL.setPublicWriteAccess(false);
    adminRoleACL.setWriteAccess(user, true);

    const adminRole = new Parse.Role(getAdminRoleName(board.id), adminRoleACL);
    adminRoleACL.setRoleWriteAccess(adminRole, true);
    adminRoleACL.setRoleReadAccess(adminRole, true);
    adminRoleACL.setRoleReadAccess(getMemberRoleName(board.id), true);
    adminRole.getUsers().add(user);

    const memberRoleACL = new Parse.ACL();
    memberRoleACL.setPublicReadAccess(false);
    memberRoleACL.setPublicWriteAccess(false);
    memberRoleACL.setRoleWriteAccess(adminRole, true);
    memberRoleACL.setRoleReadAccess(adminRole, true);

    const memberRole = new Parse.Role(getMemberRoleName(board.id), memberRoleACL);
    memberRoleACL.setRoleReadAccess(memberRole, true);
    await memberRole.save(null, {useMasterKey: true});
    await addAsMember(user, savedBoard.id);

    adminRole.getRoles().add(memberRole);
    await adminRole.save(null, {useMasterKey: true});

    const boardACL = new Parse.ACL();
    boardACL.setRoleWriteAccess(adminRole, true);
    boardACL.setRoleReadAccess(adminRole, true);
    boardACL.setRoleReadAccess(memberRole, true);

    savedBoard.setACL(boardACL);

    return (await savedBoard.save(null, {useMasterKey: true})).id;
  });

  api<JoinBoardRequest, JoinBoardResponse>("joinBoard", async (user, request) => {
    const boardQuery = new Parse.Query<Parse.Object>("Board");
    const board = await boardQuery.get(request.boardId, {
      useMasterKey: true,
    });

    if (!board) {
      throw new Error(`Board '${request.boardId}' not found`);
    }

    if (await isMember(user, request.boardId)) {
      // handle browser refresh
      if (!isOnline(user, request.boardId)) {
        goOnline(user, request.boardId);
      }

      return {
        status: "accepted",
      };
    }

    const accessPolicy = board.get("accessPolicy");
    if (accessPolicy.type !== "Public") {
      if (accessPolicy.type === "ByPassphrase") {
        if (!request.passphrase) {
          return {
            status: "passphrase_required",
          };
        }
        const passphrase = crypto
          .createHash("sha256")
          .update(request.passphrase + accessPolicy.salt)
          .digest("base64");
        if (passphrase !== accessPolicy.passphrase) {
          return {
            status: "incorrect_passphrase",
          };
        }
      }

      if (accessPolicy.type === "ManualVerification") {
        const BoardClass = Parse.Object.extend("Board");
        const boardReference = BoardClass.createWithoutData(request.boardId);

        const joinRequestQuery = new Parse.Query("JoinRequest");
        joinRequestQuery.equalTo("board", boardReference);
        joinRequestQuery.equalTo("user", user);
        const joinRequestQueryResult = await joinRequestQuery.first({
          useMasterKey: true,
        });

        if (joinRequestQueryResult) {
          if (joinRequestQueryResult.get("status") === "accepted") {
            await addAsMember(user, request.boardId);
            return {
              status: "accepted",
              joinRequestReference: joinRequestQueryResult.id,
              accessKey: joinRequestQueryResult.get("accessKey"),
            };
          }

          return {
            status: joinRequestQueryResult.get("status"),
            joinRequestReference: joinRequestQueryResult.id,
            accessKey: joinRequestQueryResult.get("accessKey"),
          };
        }
        const joinRequest = new Parse.Object("JoinRequest");
        joinRequest.set("user", user);
        joinRequest.set("board", boardReference);

        const joinRequestACL = new Parse.ACL();
        joinRequestACL.setReadAccess(user.id, true);
        joinRequestACL.setRoleReadAccess(getAdminRoleName(request.boardId), true);
        joinRequestACL.setRoleWriteAccess(getAdminRoleName(request.boardId), true);
        joinRequest.setACL(joinRequestACL);

        const savedJoinRequest = await joinRequest.save(null, {
          useMasterKey: true,
        });

        return {
          status: "pending",
          joinRequestReference: savedJoinRequest.id,
        };
      }
    }

    const userConfigurations: UserConfigurations = await board.get("userConfigurations");
    userConfigurations[user.id] = {showHiddenColumns: false};
    board.set("userConfigurations", userConfigurations);
    await board.save(null, {useMasterKey: true});

    await addAsMember(user, request.boardId);
    return {status: "accepted"};
  });

  api<JoinRequestResponse, boolean>("acceptUsers", async (user, request) => {
    await respondToJoinRequest(user, request.users, request.board, (object) => {
      object.set("status", "accepted");
      // object.set('accessKey', params.accessKey);
    });
    return true;
  });

  api<JoinRequestResponse, boolean>("rejectUsers", async (user, request) => {
    await respondToJoinRequest(user, request.users, request.board, (object) => {
      object.set("status", "rejected");
    });
    return true;
  });

  api<{board: EditBoardRequest}, boolean>("editBoard", async (user, request) => {
    await requireValidBoardAdmin(user, request.board.id);
    if (Object.keys(request.board).length <= 1) {
      throw new Error(`No fields to edit defined in edit request of board '${request.board.id}'`);
    }

    const boardQuery = new Parse.Query(Parse.Object.extend("Board"));
    const board = await boardQuery.get(request.board.id, {useMasterKey: true});
    if (!board) {
      throw new Error(`Board ${request.board.id} not found`);
    }
    if (request.board.showAuthors != null) {
      board.set("showAuthors", request.board.showAuthors);
    }
    if (request.board.timerUTCEndTime) {
      board.set("timerUTCEndTime", request.board.timerUTCEndTime);
    }
    if (request.board.name) {
      board.set("name", request.board.name);
    }
    if (request.board.accessPolicy != null) {
      if (request.board.accessPolicy.type === "ByPassphrase") {
        board.set("accessPolicy", convertToAccessPolicyByPassphrase(request.board.accessPolicy));
      } else {
        board.set("accessPolicy", request.board.accessPolicy);
      }
    }
    if (request.board.voting) {
      if (request.board.voting === "active") {
        board.set("votingIteration", board.get("votingIteration") + 1);
      }
      board.set("voting", request.board.voting);
    }
    if (request.board.moderation) {
      board.set("moderation", request.board.moderation);

      if (request.board.moderation.status === "disabled") {
        const notesQuery = new Parse.Query("Note");
        notesQuery.equalTo("board", board);
        notesQuery.first({useMasterKey: true}).then(async (note) => {
          note.set("focus", false);
          await note.save(null, {useMasterKey: true});
        });
      }
    }
    if (request.board.showNotesOfOtherUsers != undefined) {
      board.set("showNotesOfOtherUsers", request.board.showNotesOfOtherUsers);
    }

    await board.save(null, {useMasterKey: true});
    return true;
  });

  api<DeleteBoardRequest, boolean>("deleteBoard", async (user, request) => {
    await requireValidBoardAdmin(user, request.boardId);
    const boardQuery = new Parse.Query(Parse.Object.extend("Board"));
    const board = await boardQuery.get(request.boardId, {useMasterKey: true});

    const noteQuery = new Parse.Query(Parse.Object.extend("Note"));
    noteQuery.equalTo("board", board);
    const notes = await noteQuery.findAll({useMasterKey: true});
    await Parse.Object.destroyAll(notes, {useMasterKey: true});

    const voteQuery = new Parse.Query("Vote");
    voteQuery.equalTo("board", board);
    const votes = await voteQuery.findAll({useMasterKey: true});
    await Parse.Object.destroyAll(votes, {useMasterKey: true});

    const joinRequestQuery = new Parse.Query("JoinRequest");
    joinRequestQuery.equalTo("board", board);
    const joinRequests = await joinRequestQuery.findAll({useMasterKey: true});
    await Parse.Object.destroyAll(joinRequests, {useMasterKey: true});

    const voteConfigurationQuery = new Parse.Query("VoteConfiguration");
    voteConfigurationQuery.equalTo("board", board);
    const voteConfigurations = await voteConfigurationQuery.findAll({useMasterKey: true});
    await Parse.Object.destroyAll(voteConfigurations, {useMasterKey: true});

    const adminRoleQuery = new Parse.Query(Parse.Role);
    adminRoleQuery.equalTo("name", `admin_of_${request.boardId}`);
    const adminRoles = await adminRoleQuery.findAll({useMasterKey: true});
    await Parse.Object.destroyAll(adminRoles, {useMasterKey: true});

    const memberRoleQuery = new Parse.Query(Parse.Role);
    memberRoleQuery.equalTo("name", `member_of_${request.boardId}`);
    const memberRoles = await memberRoleQuery.findAll({useMasterKey: true});
    await Parse.Object.destroyAll(memberRoles, {useMasterKey: true});

    await board.destroy({useMasterKey: true});
    return true;
  });

  type ChangePermissionRequest = {
    userId: string;
    boardId: string;
    moderator: boolean;
  };

  api<ChangePermissionRequest, StatusResponse>("changePermission", async (user, request) => {
    await requireValidBoardAdmin(user, request.boardId);

    if (request.moderator) {
      await addToModerators(Parse.User.createWithoutData(request.userId), request.boardId);
      return {status: "Success", description: "User was successfully added to the list of moderators"};
    }
    // Make sure that moderators cannot remove themselfs from the list of moderators
    if (request.userId === user.id) {
      return {status: "Error", description: "You cannot remove yourself from the list of moderators"};
    }
    // Make sure that the board creator cannot get removed from the list of moderators)
    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});
    if (request.userId === board.get("owner").id) {
      return {status: "Error", description: "The creator of the board cannot be removed from the list of moderators"};
    }

    await removeFromModerators(Parse.User.createWithoutData(request.userId), request.boardId);
    return {status: "Success", description: "User was successfully removed from the list of moderators"};
  });

  /**
   * Cancel voting
   */
  api<{boardId: string}, StatusResponse>("cancelVoting", async (user, request) => {
    await requireValidBoardAdmin(user, request.boardId);
    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});

    // Check if the board exists
    if (!board) {
      return {status: "Error", description: `Board '${request.boardId}' does not exist`};
    }

    // Check if the board exists
    if ((await board.get("voting")) === "disabled") {
      return {status: "Error", description: `Voting is already disabled`};
    }

    const votingIteration = await board.get("votingIteration");

    const voteConfigurationQuery = new Parse.Query("VoteConfiguration");
    voteConfigurationQuery.equalTo("board", board);
    // Voting iteraion already incremented
    const voteConfiguration = await voteConfigurationQuery.equalTo("votingIteration", votingIteration).first({useMasterKey: true});
    await voteConfiguration.destroy({useMasterKey: true});

    const voteQuery = new Parse.Query("Vote");
    voteQuery.equalTo("board", board);
    voteQuery.equalTo("votingIteration", votingIteration);
    const votes = await voteQuery.findAll({useMasterKey: true});
    await Parse.Object.destroyAll(votes, {useMasterKey: true});

    // add new value canceled?
    board.set("voting", "disabled");
    await board.save(null, {useMasterKey: true});

    return {status: "Success", description: "Current voting phase was canceled"};
  });

  api<{endDate: Date; boardId: string}, StatusResponse>("setTimer", async (user, request) => {
    await requireValidBoardAdmin(user, request.boardId);

    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});
    if (!board) {
      return {status: "Error", description: `Board '${request.boardId}' does not exist`};
    }

    board.set("timerUTCEndTime", request.endDate);
    await board.save(null, {useMasterKey: true});

    return {status: "Success", description: "Timer was successfully set"};
  });

  api<{boardId: string}, StatusResponse>("cancelTimer", async (user, request) => {
    await requireValidBoardAdmin(user, request.boardId);

    const board = await new Parse.Query("Board").get(request.boardId, {useMasterKey: true});
    if (!board) {
      return {status: "Error", description: `Board '${request.boardId}' does not exist`};
    }

    board.unset("timerUTCEndTime");
    await board.save(null, {useMasterKey: true});

    return {status: "Success", description: "Timer was successfully removed"};
  });

  api<{}, string>("getServerTime", async (user, request) => new Date().toUTCString());
};
