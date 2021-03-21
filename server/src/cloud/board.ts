import {
  getAdminRoleName,
  getMemberRoleName,
  isMember,
  requireValidBoardAdmin,
} from "./permission";
import { api } from "./util";
import { newObjectId } from "parse-server/lib/cryptoUtils";
import { serverConfig } from "../index";

interface JoinBoardResponse {
  status: "accepted" | "rejected" | "pending";
  joinRequestReference?: string;
}

const addAsMember = async (user: Parse.User, boardId: string) => {
  const memberRoleQuery = new Parse.Query(Parse.Role);
  memberRoleQuery.equalTo("name", getMemberRoleName(boardId));

  const memberRole = await memberRoleQuery.first({ useMasterKey: true });
  if (memberRole) {
    memberRole.getUsers().add(user);
    return memberRole.save(null, { useMasterKey: true });
  }

  throw new Error(`No roles for board '${boardId}' found`);
};

const respondToJoinRequest = async (
  currentUser: Parse.User,
  user: string,
  board: string,
  manipulate: (object: Parse.Object) => void
) => {
  await requireValidBoardAdmin(currentUser, board);

  const BoardClass = Parse.Object.extend("Board");
  const joinRequestQuery = new Parse.Query("JoinRequest");
  joinRequestQuery.equalTo("board", BoardClass.createWithoutData(board));
  joinRequestQuery.equalTo("user", Parse.User.createWithoutData(user));
  const joinRequestQueryResult = await joinRequestQuery.first({
    useMasterKey: true,
  });

  if (joinRequestQueryResult) {
    manipulate(joinRequestQueryResult);
    await joinRequestQueryResult.save(null, { useMasterKey: true });
  } else {
    throw new Error(
      `Join request not found for user '${[user]}' on board '${board}'`
    );
  }
};

export interface CreateBoardRequest {
  columns: {
    name: string;
    hidden: boolean;
  }[];
  name?: string;
  joinConfirmationRequired?: boolean;
  encryptedContent?: boolean;
  accessCode?: string;
}

export interface EditBoardRequest {
  board: string;
  showContentOfOtherUsers?: boolean;
  showAuthors?: boolean;
  timerUTCEndTime?: Date;
  expirationUTCTime?: Date;
}

export interface DeleteBoardRequest {
  board: string;
}

export interface JoinRequestResponse {
  board: string;
  user: string;
}

export interface JoinBoardRequest {
  boardId: string;
}

export const initializeBoardFunctions = () => {
  Parse.Cloud["onLiveQueryEvent"](({event, sessionToken, ...other}) => {
    if (event === "connect" || event === "ws_disconnect") {
      const query = new Parse.Query<Parse.Object>("_Session");
      query.equalTo("sessionToken", sessionToken);

      query.first({ useMasterKey: true }).then((session) => {
        const user = session.get('user');

        const rolesQuery = new Parse.Query(Parse.Role);
        rolesQuery.equalTo("users", user);

        if(event === "ws_disconnect"){
          rolesQuery.find({ useMasterKey: true }).then((roles) => {
            roles.forEach(role => {
              role.getUsers().remove(user)
              role.save(null, { useMasterKey: true })
            });
          });          
        }else{
          //TODO: how to get the user online again? We don't know anymore on which board (s)he was a member
        }
      });
    }
  });

  api<CreateBoardRequest, string>("createBoard", async (user, request) => {
    const board = new Parse.Object("Board");
    const columns = request.columns.reduce((acc, current) => {
      acc[newObjectId(serverConfig.objectIdSize)] = {
        name: current.name,
        hidden: current.hidden,
      };
      return acc;
    }, {});
    const savedBoard = await board.save(
      { ...request, columns },
      { useMasterKey: true }
    );

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

    const memberRole = new Parse.Role(
      getMemberRoleName(board.id),
      memberRoleACL
    );
    memberRoleACL.setRoleReadAccess(memberRole, true);
    await memberRole.save(null, { useMasterKey: true });
    await addAsMember(user, savedBoard.id);

    adminRole.getRoles().add(memberRole);
    await adminRole.save(null, { useMasterKey: true });

    const boardACL = new Parse.ACL();
    boardACL.setRoleWriteAccess(adminRole, true);
    boardACL.setRoleReadAccess(adminRole, true);
    boardACL.setRoleReadAccess(memberRole, true);

    savedBoard.setACL(boardACL);

    return (await savedBoard.save(null, { useMasterKey: true })).id;
  });

  api<JoinBoardRequest, JoinBoardResponse>(
    "joinBoard",
    async (user, request) => {
      const boardQuery = new Parse.Query<Parse.Object>("Board");
      const board = await boardQuery.get(request.boardId, {
        useMasterKey: true,
      });

      if (!board) {
        throw new Error(`Board '${request.boardId}' not found`);
      }

      if (await isMember(user, request.boardId)) {
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
        } else {
          const joinRequest = new Parse.Object("JoinRequest");
          joinRequest.set("user", user);
          joinRequest.set("board", boardReference);

          const joinRequestACL = new Parse.ACL();
          joinRequestACL.setReadAccess(user.id, true);
          joinRequestACL.setRoleReadAccess(
            getAdminRoleName(request.boardId),
            true
          );
          joinRequestACL.setRoleWriteAccess(
            getAdminRoleName(request.boardId),
            true
          );
          joinRequest.setACL(joinRequestACL);

          const savedJoinRequest = await joinRequest.save(null, {
            useMasterKey: true,
          });
          return {
            status: "pending",
            joinRequestReference: savedJoinRequest.id,
          };
        }
      } else {
        await addAsMember(user, request.boardId);
        return { status: "accepted" };
      }
    }
  );

  api<JoinRequestResponse, boolean>("acceptUser", async (user, request) => {
    await respondToJoinRequest(user, request.user, request.board, (object) => {
      object.set("status", "accepted");
      // object.set('accessKey', params.accessKey);
    });
    return true;
  });

  api<JoinRequestResponse, boolean>("rejectUser", async (user, request) => {
    await respondToJoinRequest(user, request.user, request.board, (object) => {
      object.set("status", "rejected");
    });
    return true;
  });

  api<DeleteBoardRequest, boolean>("deleteBoard", async (user, request) => {
    await requireValidBoardAdmin(user, request.board);

    const BoardClass = Parse.Object.extend("Board");
    const boardReference = BoardClass.createWithoutData(request.board);

    const votesQuery = new Parse.Query(Parse.Object.extend("Vote"));
    votesQuery.equalTo("board", boardReference);
    const notesQuery = new Parse.Query(Parse.Object.extend("Note"));
    notesQuery.equalTo("board", boardReference);
    const boardQuery = new Parse.Query(BoardClass);
    boardQuery.equalTo("objectId", request.board);

    await Parse.Object.destroyAll(
      await Parse.Query.or(votesQuery, notesQuery, boardQuery).find({
        useMasterKey: true,
      }),
      { useMasterKey: true }
    );
    return true;
  });

  api<EditBoardRequest, boolean>("editBoard", async (user, request) => {
    await requireValidBoardAdmin(user, request.board);
    if (Object.keys(request).length <= 1) {
      throw new Error(
        `No fields to edit defined in edit request of board '${request.board}'`
      );
    }

    const boardQuery = new Parse.Query(Parse.Object.extend("Board"));
    const board = await boardQuery.get(request.board, { useMasterKey: true });
    if (!board) {
      throw new Error(`Board ${request.board} not found`);
    }
    if (request.showContentOfOtherUsers) {
      board.set("showContentOfOtherUsers", request.showContentOfOtherUsers);
    }
    if (request.showAuthors) {
      board.set("showAuthors", request.showAuthors);
    }
    if (request.timerUTCEndTime) {
      board.set("timerUTCEndTime", request.timerUTCEndTime);
    }
    if (request.expirationUTCTime) {
      board.set("expirationUTCTime", request.expirationUTCTime);
    }

    await board.save();
    return true;
  });
};
