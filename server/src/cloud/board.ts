import {newObjectId} from "parse-server/lib/cryptoUtils";
import {getAdminRoleName, getMemberRoleName, isMember, isOnline, requireValidBoardAdmin} from "./permission";
import {api} from "./util";
import {serverConfig} from "../index";
import Color, {isOfTypeColor} from "../util/Color";

interface JoinBoardResponse {
  status: "accepted" | "rejected" | "pending";
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
  joinConfirmationRequired?: boolean;
  encryptedContent?: boolean;
  accessCode?: string;
}

export type EditableBoardAttributes = {
  name: string;
  showContentOfOtherUsers?: boolean;
  showAuthors?: boolean;
  timerUTCEndTime?: Date;
  expirationUTCTime?: Date;
  joinConfirmationRequired?: boolean;
  voting?: "active" | "disabled";
  votingIteration: number;
};

export type EditBoardRequest = {id: string} & Partial<EditableBoardAttributes>;

export type DeleteBoardRequest = {id: string};

export interface JoinRequestResponse {
  board: string;
  users: string[];
}

export interface JoinBoardRequest {
  boardId: string;
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
    const savedBoard = await board.save({...request, columns, voteLimit: 10, votingIteration: 0}, {useMasterKey: true});

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

    if (board.get("joinConfirmationRequired")) {
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
    if (request.board.showContentOfOtherUsers != null) {
      board.set("showContentOfOtherUsers", request.board.showContentOfOtherUsers);
    }
    if (request.board.showAuthors != null) {
      board.set("showAuthors", request.board.showAuthors);
    }
    if (request.board.timerUTCEndTime) {
      board.set("timerUTCEndTime", request.board.timerUTCEndTime);
    }
    if (request.board.expirationUTCTime) {
      board.set("expirationUTCTime", request.board.expirationUTCTime);
    }
    if (request.board.name) {
      board.set("name", request.board.name);
    }
    if (request.board.joinConfirmationRequired != null) {
      board.set("joinConfirmationRequired", request.board.joinConfirmationRequired);
    }
    if (request.board.voting) {
      if (request.board.voting === "active") {
        board.set("votingIteration", board.get("votingIteration") + 1);
      }
      board.set("voting", request.board.voting);
    }

    await board.save(null, {useMasterKey: true});
    return true;
  });

  api<DeleteBoardRequest, boolean>("deleteBoard", async (user, request) => {
    await requireValidBoardAdmin(user, request.id);
    const boardQuery = new Parse.Query(Parse.Object.extend("Board"));
    const board = await boardQuery.get(request.id, {useMasterKey: true});

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

    const adminRoleQuery = new Parse.Query(Parse.Role);
    adminRoleQuery.equalTo("name", `admin_of_${request.id}`);
    const adminRoles = await adminRoleQuery.findAll({useMasterKey: true});
    await Parse.Object.destroyAll(adminRoles, {useMasterKey: true});

    const memberRoleQuery = new Parse.Query(Parse.Role);
    memberRoleQuery.equalTo("name", `member_of_${request.id}`);
    const memberRoles = await memberRoleQuery.findAll({useMasterKey: true});
    await Parse.Object.destroyAll(memberRoles, {useMasterKey: true});

    await board.destroy({useMasterKey: true});
    return true;
  });
};
