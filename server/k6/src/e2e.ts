import { check, group, sleep } from "k6";
import http from "k6/http";

import { options } from "./options.ts";
import { HealthClient } from "./api/health/api.ts";
import { InfoClient } from "./api/info/api.ts";
import { FeedbackClient } from "./api/feedback/api.ts";
import { CreateFeedbackRequest } from "./api/feedback/requests.ts";
import { AuthClient } from "./api/auth/api.ts";
import { AnonymousSignUpRequest } from "./api/auth/requests.ts";
import { BoardClient } from "./api/board/api.ts";
import {
  CreateBoardRequest,
  JoinBoardRequest,
  SetTimerRequest,
  UpdateBoardRequest
} from "./api/board/requests.ts";
import { UserClient } from "./api/user/api.ts";
import { UpdateUserRequest } from "./api/user/requests.ts";
import { ColumnClient } from "./api/column/api.ts";
import {
  CreateColumnRequest,
  UpdateColumnRequest
} from "./api/column/requests.ts";
import { NoteClient } from "./api/note/api.ts";
import {
  CreateNoteRequest,
  DeleteNoteRequest,
  UpdateNoteRequest
} from "./api/note/requests.ts";
import { VotingClient } from "./api/voting/api.ts";
import { CreateVotingRequest } from "./api/voting/requests.ts";
import { VoteClient } from "./api/vote/api.ts";
import { SessionClient } from "./api/session/api.ts";
import {
  BoardSessionUpdateRequest,
  BoardSessionsUpdateRequest
} from "./api/session/requests.ts";
import { SessionRequestClient } from "./api/sessionRequest/api.ts";
import { ReactionClient } from "./api/reaction/api.ts";
import {
  CreateReactionRequest,
} from "./api/reaction/requests.ts";
import { BoardReactionClient } from "./api/boardReaction/api.ts";
import { BoardTemplateClient } from "./api/boardTemplate/api.ts";
import {
  CreateBoardTemplateRequest,
  UpdateBoardTemplateRequest
} from "./api/boardTemplate/requests.ts";
import { ColumnTemplateClient } from "./api/columnTemplate/api.ts";
import { ColumnTemplateRequest } from "./api/columnTemplate/requests.ts";

options.vus = 1;
options.iterations = 1;
options.thresholds = {
  checks: ["rate==1.0"]
}

export { options };

export default function () {
  const authClient = new AuthClient();
  const healthClient = new HealthClient();
  const infoClient = new InfoClient();
  const feedbackClient = new FeedbackClient();
  const boardClient = new BoardClient();
  const userClient = new UserClient();
  const columnClient = new ColumnClient();
  const noteClient = new NoteClient();
  const votingClient = new VotingClient();
  const voteClient = new VoteClient();
  const sessionClient = new SessionClient();
  const sessionRequestClient = new SessionRequestClient();
  const reactionClient = new ReactionClient();
  const boardReactionClient = new BoardReactionClient();
  const boardTemplateClient = new BoardTemplateClient();
  const columnTemplateClient = new ColumnTemplateClient();

  group("check health", () => {
    const response = healthClient.getHealth();

    check(response, {
      "verify health status is 204": (r) => r.status === 204
    });
  });

  group("Check info", () => {
    const [info, response] = infoClient.getInfo();

    check(response, {
      "verify info status is 200": (r) => r.status === 200,
      "verify info body is defined": (r) => info !== null && info !== undefined,
    });
  });

  group("Check feedback", () => {
    const [info] = infoClient.getInfo();
    if (!info?.feedbackEnabled) {
      // Don't run the tests if feedback is not configured
      return;
    }

    const bugFeedback: CreateFeedbackRequest = {
      text: "I have found a bug",
      type: "BUG_REPORT",
      contact: "load-test-bug@scrumlr.io"
    };
    const bugResponse = feedbackClient.sendFeedback(bugFeedback);
    check(bugResponse, {
      "verify bug response status is 201": (r) => r.status === 201
    });

    const featureRequestFeedback: CreateFeedbackRequest = {
      text: "I want feature xyz",
      type: "FEATURE_REQUEST",
      contact: "load-test-feat-request@scrumlr.io"
    };
    const featureResponse = feedbackClient.sendFeedback(featureRequestFeedback);
    check(featureResponse, {
      "verify feature response status is 201": (r) => r.status === 201
    });

    const praiseFeedback: CreateFeedbackRequest = {
      text: "Thanks",
      type: "PRAISE",
      contact: "load-test-praise@scrumlr.io"
    };
    const praiseResponse = feedbackClient.sendFeedback(praiseFeedback);
    check(praiseResponse, {
      "verify praise response status is 201": (r) => r.status === 201
    });
  });

  group("Check login", () => {
    const anonymousContext = new http.CookieJar();
    const anonymousName = `Stan-E2E-Test-Login-${Date.now()}`;
    const anonymousRequest: AnonymousSignUpRequest = { name: anonymousName };
    const [anonymousUser, authResponse] = authClient.loginAnonymous(anonymousRequest, anonymousContext);

    check(authResponse, {
      "verify anonymous login status is 201": (r) => r.status === 201,
      "verify anonymous login body is defined": (r) => anonymousUser !== null && anonymousUser !== undefined,
      "verify user is anonymous": () => anonymousUser?.accountType === "ANONYMOUS",
      "verify user name": () => anonymousUser?.name === anonymousName
    });

    const logoutResponse = authClient.logout(anonymousContext);
    check(logoutResponse, {
      "verify logout response status is 204": (r) => r.status === 204
    });

    const trimmedUserContext = new http.CookieJar();
    const trimmedNameRequest: AnonymousSignUpRequest = { name: "  John Doe  " };
    const [trimmedNameUser, trimmedNameResponse] = authClient.loginAnonymous(trimmedNameRequest, trimmedUserContext);
    check(trimmedNameResponse, {
      "verify create trimmed name user status is 201": (r) => r.status === 201,
      "verify trimmed name user body is defined": (r) => r.body !== null && r.body !== undefined,
      "verify trimmed user account type is anonymous": () => trimmedNameUser?.accountType === "ANONYMOUS",
      "verify trimmed user name is John Doe": () => trimmedNameUser?.name === "John Doe"
    });

    const invalidNameRequest: AnonymousSignUpRequest = { name: "No Name\nHello" };
    const [, invalidNameResponse] = authClient.loginAnonymous(invalidNameRequest);
    check(invalidNameResponse, {
      "verify invalid name response status is 500": (r) => r.status === 500
    });
  });

  group("Check users", () => {
    const userContext = new http.CookieJar();
    const userRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Users-${Date.now()}` };
    const [user] = authClient.loginAnonymous(userRequest, userContext);
    if (!user) {
      return;
    }

    const secondUserContext = new http.CookieJar();
    const secondUserRequest: AnonymousSignUpRequest = { name: `Stan-Load-Test-${Date.now()}` };
    const [secondUser] = authClient.loginAnonymous(secondUserRequest, secondUserContext);
    if (!secondUser) {
      return;
    }

    const [, unauthenticatedCurrentUserResponse] = userClient.getCurrentUser(new http.CookieJar());
    check(unauthenticatedCurrentUserResponse, {
      "verify get unauthenticated user status is 401": (r) => r.status === 401
    });

    const [currentUser, currentUserResponse] = userClient.getCurrentUser(userContext);
    check(currentUserResponse, {
      "verify get user status is 200": (r) => r.status === 200,
      "verify get user id matches": () => currentUser?.id === user.id
    });

    const [, unauthenticatedGetUserResponse] = userClient.getUserById(user.id, new http.CookieJar());
    check(unauthenticatedGetUserResponse, {
      "verify unauthenticated get user status is 401": (r) => r.status === 401
    });

    const [ownUser, ownUserResponse] = userClient.getUserById(user.id, userContext);
    check(ownUserResponse, {
      "verify get own user status is 200": (r) => r.status === 200,
      "verify get own user id matches": () => ownUser?.id === user.id
    });

    const [differentUser, differentUserResponse] = userClient.getUserById(secondUser.id, userContext);
    check(differentUserResponse, {
      "verify get different user status is 200": (r) => r.status === 200,
      "verify get different user id matches": () => differentUser?.id === secondUser?.id
    });

    const updatedName = `Stan-Load-Test-${Date.now()}`;
    const updateUserRequest: UpdateUserRequest = { name: updatedName };

    const [, unauthenticatedUserUpdateResponse] = userClient.updateUser(updateUserRequest, new http.CookieJar());
    check(unauthenticatedUserUpdateResponse, {
      "verify unauthenticated update user status is 401": (r) => r.status === 401
    });

    const [updatedUser, updateUserResponse] = userClient.updateUser(updateUserRequest, userContext);
    check(updateUserResponse, {
      "verify user update status is 200": (r) => r.status === 200,
      "verify updated user id matches": () => updatedUser?.id === user.id,
      "verify updated user name matches": () => updatedUser?.name === updatedName
    });

    const unauthenticatedDeleteUserResponse = userClient.deleteUser(secondUser.id, new http.CookieJar());
    check(unauthenticatedDeleteUserResponse, {
      "verify delete unauthenticated status is 401": (r) => r.status === 401
    });

    const deleteUserResponse = userClient.deleteUser(user.id, userContext);
    check(deleteUserResponse, {
      "verify delete user status is 204": (r) => r.status === 204
    });
  });

  group("Check board", () => {
    const ownerContext = new http.CookieJar();
    const ownerRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Board-Owner-${Date.now()}` };
    const [, ] = authClient.loginAnonymous(ownerRequest, ownerContext);

    const participantContext = new http.CookieJar();
    const participantRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Board-Participant-${Date.now()}` };
    const [, ] = authClient.loginAnonymous(participantRequest, participantContext);

    const boardName = `E2E-Board-Test-${Date.now()}`;
    const createBoardRequest: CreateBoardRequest = {
      name: boardName,
      description: "This is the best description of a board, or not",
      accessPolicy: "PUBLIC",
      columns: [
        { name: `E2E-Test-Board-1-${Date.now()}`, index: 0, color: "backlog-blue", visible: true },
        { name: `E2E-Test-Board-2-${Date.now()}`, index: 1, color: "online-orange", visible: true },
        { name: `E2E-Test-Board-3-${Date.now()}`, index: 2, color: "goal-green", visible: false }
      ]
    };

    const [, unauthenticatedCreateResponse] = boardClient.createBoard(createBoardRequest, new http.CookieJar());
    check(unauthenticatedCreateResponse, {
      "verify unauthenticated create board status is 401": (r) => r.status === 401
    });

    const [createdPublicBoard, publicBoardResponse] = boardClient.createBoard(createBoardRequest, ownerContext);
    check(publicBoardResponse, {
      "verify board created status is 201": (r) => r.status === 201,
      "verify created board access policy is PUBLIC": () => createdPublicBoard?.accessPolicy === "PUBLIC",
      "verify created board name matches": () => createdPublicBoard?.name === boardName
    });

    if (!createdPublicBoard) {
      return;
    }

    const [, unauthenticatedGetBoardsResponse] = boardClient.getBoards(new http.CookieJar());
    check(unauthenticatedGetBoardsResponse, {
      "verify unauthenticated get boards status is 401": (r) => r.status === 401
    });

    const [ownerBoards, ownerGetBoardsResponse] = boardClient.getBoards(ownerContext);
    check(ownerGetBoardsResponse, {
      "verify owner get boards status is 200": (r) => r.status === 200,
      "verify owner get boards count is 1": () => ownerBoards?.length === 1
    });

    const [participantBoards, participantGetBoardsResponse] = boardClient.getBoards(participantContext);
    check(participantGetBoardsResponse, {
      "verify participant get boards status is 200": (r) => r.status === 200,
      "verify participant get boards count is 0": () => participantBoards?.length === 0
    });

    const [, unauthenticatedGetBoardResponse] = boardClient.getBoard(createdPublicBoard.id, new http.CookieJar());
    check(unauthenticatedGetBoardResponse, {
      "verify unauthenticated get board status is 401": (r) => r.status === 401
    });

    const [board, ownerGetBoardResponse] = boardClient.getBoard(createdPublicBoard.id, ownerContext);
    check(ownerGetBoardResponse, {
      "verify owner get board status is 200": (r) => r.status === 200,
      "verify board get name matches": () => board?.name === boardName
    });

    const [, participantGetBoardResponse] = boardClient.getBoard(createdPublicBoard.id, participantContext);
    check(participantGetBoardResponse, {
      "verify participant get board before join status is 403": (r) => r.status === 403
    });

    const [boardUsers, boardUsersResponse] = boardClient.getBoardUsers(createdPublicBoard.id, ownerContext);
    check(boardUsersResponse, {
      "verify owner get board users status is 200": (r) => r.status === 200,
      "verify initial board users count is 1": () => boardUsers?.length === 1
    });

    const joinRequest: JoinBoardRequest = {};
    const unauthenticatedJoinResponse = boardClient.joinBoard(createdPublicBoard.id, joinRequest, new http.CookieJar());
    check(unauthenticatedJoinResponse, {
      "verify unauthenticated join board status is 401": (r) => r.status === 401
    });

    const [unauthenticatedBoardUsers, unauthenticatedBoardUsersResponse] = boardClient.getBoardUsers(createdPublicBoard.id, ownerContext);
    check(unauthenticatedBoardUsersResponse, {
      "verify board users status is 200": (r) => r.status === 200,
      "verify board users count is 1": () => unauthenticatedBoardUsers?.length === 1
    });

    const boardJoinResponse = boardClient.joinBoard(createdPublicBoard.id, joinRequest, participantContext);
    check(boardJoinResponse, {
      "verify participant join board status is 201": (r) => r.status === 201
    });

    const [newBoardUsers, newBoardUsersResponse] = boardClient.getBoardUsers(createdPublicBoard.id, ownerContext);
    check(newBoardUsersResponse, {
      "verify board users status is 200": (r) => r.status === 200,
      "verify board users count is 2": () => newBoardUsers?.length === 2
    });

    const timerRequest: SetTimerRequest = { minutes: 3 };
    const [, participantTimerResponse] = boardClient.setTimer(createdPublicBoard.id, timerRequest, participantContext);
    check(participantTimerResponse, {
      "verify participant set timer status is 403": (r) => r.status === 403
    });

    const [timerBoard, ownerTimerResponse] = boardClient.setTimer(createdPublicBoard.id, timerRequest, ownerContext);
    check(ownerTimerResponse, {
      "verify owner set timer status is 200": (r) => r.status === 200,
      "verify timer start is defined": () => timerBoard?.timerStart !== undefined && timerBoard?.timerStart !== null,
      "verify timer end is defined": () => timerBoard?.timerEnd !== undefined && timerBoard?.timerEnd !== null
    });

    const [, participantIncrementTimerResponse] = boardClient.incrementTimer(createdPublicBoard.id, participantContext);
    check(participantIncrementTimerResponse, {
      "verify participant increment timer status is 403": (r) => r.status === 403
    });

    const [incrementTimerBoard, ownerIncrementTimerResponse] = boardClient.incrementTimer(createdPublicBoard.id, ownerContext);
    check(ownerIncrementTimerResponse, {
      "verify owner increment timer status is 200": (r) => r.status === 200,
      "verify increment timer timer start matches": () => incrementTimerBoard?.timerStart === timerBoard?.timerStart,
      "verify increment timer timer end is updated": () => incrementTimerBoard?.timerEnd !== timerBoard?.timerEnd
    });

    const [, participantDeleteTimerResponse] = boardClient.deleteTimer(createdPublicBoard.id, participantContext);
    check(participantDeleteTimerResponse, {
      "verify participant delete timer status is 403": (r) => r.status === 403
    });

    const [deletedTimerBoard, ownerDeleteTimerResponse] = boardClient.deleteTimer(createdPublicBoard.id, ownerContext);
    check(ownerDeleteTimerResponse, {
      "verify owner delete timer status is 200": (r) => r.status === 200,
      "verify timer start is cleared": () => deletedTimerBoard?.timerStart === undefined || deletedTimerBoard?.timerStart === null,
      "verify timer end is cleared": () => deletedTimerBoard?.timerEnd === undefined || deletedTimerBoard?.timerEnd === null
    });

    const unauthExportRes = boardClient.exportBoard(createdPublicBoard.id, new http.CookieJar());
    check(unauthExportRes, {
      "verify unauthenticated export board status is 401": (r) => r.status === 401
    });

    const exportJsonRes = boardClient.exportBoard(createdPublicBoard.id, ownerContext, { Accept: "application/json" });
    check(exportJsonRes, {
      "verify export board JSON status is 200": (r) => r.status === 200
    });

    const exportCsvRes = boardClient.exportBoard(createdPublicBoard.id, ownerContext, { Accept: "text/csv" });
    check(exportCsvRes, {
      "verify export board CSV status is 200": (r) => r.status === 200
    });

    const updatedName = `E2E-Board-Test-Updated-${Date.now()}`;
    const boardUpdateRequest: UpdateBoardRequest = {
      name: updatedName,
      isLocked: true,
    };
    const [, participantUpdatedResponse] = boardClient.updateBoard(createdPublicBoard.id, boardUpdateRequest, participantContext);
    check(participantUpdatedResponse, {
      "verify participant update board status is 403": (r) => r.status === 403
    });

    const [updatedBoard, ownerUpdatedResponse] = boardClient.updateBoard(createdPublicBoard.id, boardUpdateRequest, ownerContext);
    check(ownerUpdatedResponse, {
      "verify owner update board status is 200": (r) => r.status === 200,
      "verify updated board name matches": () => updatedBoard?.name === updatedName,
      "verify updated board is locked": () => updatedBoard?.isLocked === true
    });

    const participantDeleteBoardResponse = boardClient.deleteBoard(createdPublicBoard.id, participantContext);
    check(participantDeleteBoardResponse, {
      "verify participant delete board status is 403": (r) => r.status === 403
    });

    const ownerDeleteBoardResponse = boardClient.deleteBoard(createdPublicBoard.id, ownerContext);
    check(ownerDeleteBoardResponse, {
      "verify owner delete board status is 204": (r) => r.status === 204
    });
  });

  group("Check columns", () => {
    const ownerContext = new http.CookieJar();
    const ownerRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Column-Owner-${Date.now()}` };
    const [, ] = authClient.loginAnonymous(ownerRequest, ownerContext);

    const authenticatedContext = new http.CookieJar();
    const authenticatedRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Column-Authenticated-${Date.now()}` };
    const [, ] = authClient.loginAnonymous(authenticatedRequest, authenticatedContext);

    const participantContext = new http.CookieJar();
    const participantRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Column-Participant-${Date.now()}` };
    const [, ] = authClient.loginAnonymous(participantRequest, participantContext);

    const createBoardRequest: CreateBoardRequest = {
      name: `E2E-Column-Test-${Date.now()}`,
      accessPolicy: "PUBLIC",
      columns: [
        { name: `E2E-Test-Column-1-${Date.now()}`, index: 0, color: "backlog-blue", visible: true },
        { name: `E2E-Test-Column-2-${Date.now()}`, index: 1, color: "online-orange", visible: true },
        { name: `E2E-Test-Column-3-${Date.now()}`, index: 2, color: "goal-green", visible: false }
      ]
    };
    const [board] = boardClient.createBoard(createBoardRequest, ownerContext);
    if (!board) {
      return;
    }

    const joinResponse = boardClient.joinBoard(board.id, {}, participantContext);
    check(joinResponse, {
      "verify joinBoard status is 201": (r) => r.status === 201
    });

    const createColumnRequest: CreateColumnRequest = {
      name: `E2E-Test-Column-Created-${Date.now()}`,
      color: "poker-purple",
      visible: true,
      index: 4,
      description: "Things that went well"
    };

    const [, unauthenticatedCreateColumnResponse] = columnClient.createColumn(board.id, createColumnRequest, new http.CookieJar());
    check(unauthenticatedCreateColumnResponse, {
      "verify unauthenticated create column status is 401": (r) => r.status === 401
    });

    const [, authenticatedCreateColumnResponse] = columnClient.createColumn(board.id, createColumnRequest, authenticatedContext);
    check(authenticatedCreateColumnResponse, {
      "verify authenticated user create column status is 403": (r) => r.status === 403
    });

    const [, participantCreateColumnResponse] = columnClient.createColumn(board.id, createColumnRequest, participantContext);
    check(participantCreateColumnResponse, {
      "verify participant create column status is 403": (r) => r.status === 403
    });

    const [createdColumn, ownerCreateColumnResponse] = columnClient.createColumn(board.id, createColumnRequest, ownerContext);
    check(ownerCreateColumnResponse, {
      "verify owner create column status is 201": (r) => r.status === 201,
      "verify created column name matches": () => createdColumn?.name === createColumnRequest.name,
      "verify created column color matches": () => createdColumn?.color === createColumnRequest.color,
      "verify created column visible is true": () => createdColumn?.visible === true,
      "verify created column index is 3": () => createdColumn?.index === 3
    });

    if (!createdColumn) {
      return;
    }

    const [, unauthenticatedGetColumnsResponse] = columnClient.getColumns(board.id, new http.CookieJar());
    check(unauthenticatedGetColumnsResponse, {
      "verify unauthenticated get columns status is 401": (r) => r.status === 401
    });

    const [, authenticatedGetColumnsResponse] = columnClient.getColumns(board.id, authenticatedContext);
    check(authenticatedGetColumnsResponse, {
      "verify authenticated user get columns status is 403": (r) => r.status === 403
    });

    const [participantColumns, participantGetColumnsResponse] = columnClient.getColumns(board.id, participantContext);
    check(participantGetColumnsResponse, {
      "verify participant get columns status is 200": (r) => r.status === 200,
      "verify participant columns count is 4": () => participantColumns?.length === 4
    });

    const [ownerColumns, ownerGetColumnsResponse] = columnClient.getColumns(board.id, ownerContext);
    check(ownerGetColumnsResponse, {
      "verify owner get columns status is 200": (r) => r.status === 200,
      "verify owner columns count is 4": () => ownerColumns?.length === 4
    });

    const [, unauthenticatedGetColumnResponse] = columnClient.getColumn(board.id, createdColumn.id, new http.CookieJar());
    check(unauthenticatedGetColumnResponse, {
      "verify unauthenticated get column status is 401": (r) => r.status === 401
    });

    const [, authenticatedGetColumnResponse] = columnClient.getColumn(board.id, createdColumn.id, authenticatedContext);
    check(authenticatedGetColumnResponse, {
      "verify authenticated user get column status is 403": (r) => r.status === 403
    });

    const [participantColumn, participantGetColumnResponse] = columnClient.getColumn(board.id, createdColumn.id, participantContext);
    check(participantGetColumnResponse, {
      "verify participant get column status is 200": (r) => r.status === 200,
      "verify participant column id matches": () => participantColumn?.id === createdColumn.id,
      "verify participant column name matches": () => participantColumn?.name === createdColumn.name
    });

    const [ownerColumn, ownerGetColumnResponse] = columnClient.getColumn(board.id, createdColumn.id, ownerContext);
    check(ownerGetColumnResponse, {
      "verify owner get column status is 200": (r) => r.status === 200,
      "verify owner column id matches": () => ownerColumn?.id === createdColumn.id,
      "verify owner column name matches": () => ownerColumn?.name === createdColumn.name
    });

    const updateColumnRequest: UpdateColumnRequest = {
      name: `E2E-Test-Column-Updated-${Date.now()}`,
      color: "online-orange",
      visible: true,
      index: 1,
      description: "Updated description"
    };

    const [, unauthenticatedUpdateColumnResponse] = columnClient.updateColumn(board.id, createdColumn.id, updateColumnRequest, new http.CookieJar());
    check(unauthenticatedUpdateColumnResponse, {
      "verify unauthenticated update column status is 401": (r) => r.status === 401
    });

    const [, authenticatedUpdateColumnResponse] = columnClient.updateColumn(board.id, createdColumn.id, updateColumnRequest, authenticatedContext);
    check(authenticatedUpdateColumnResponse, {
      "verify authenticated user update column status is 403": (r) => r.status === 403
    });

    const [, participantUpdateColumnResponse] = columnClient.updateColumn(board.id, createdColumn.id, updateColumnRequest, participantContext);
    check(participantUpdateColumnResponse, {
      "verify participant update column status is 403": (r) => r.status === 403
    });

    const [updatedColumn, ownerUpdateColumnResponse] = columnClient.updateColumn(board.id, createdColumn.id, updateColumnRequest, ownerContext);
    check(ownerUpdateColumnResponse, {
      "verify owner update column status is 200": (r) => r.status === 200,
      "verify updated column name matches": () => updatedColumn?.name === updateColumnRequest.name,
      "verify updated column color matches": () => updatedColumn?.color === updateColumnRequest.color
    });

    const unauthenticatedDeleteColumnResponse = columnClient.deleteColumn(board.id, createdColumn.id, new http.CookieJar());
    check(unauthenticatedDeleteColumnResponse, {
      "verify unauthenticated delete column status is 401": (r) => r.status === 401
    });

    const authenticatedDeleteColumnResponse = columnClient.deleteColumn(board.id, createdColumn.id, authenticatedContext);
    check(authenticatedDeleteColumnResponse, {
      "verify authenticated user delete column status is 403": (r) => r.status === 403
    });

    const participantDeleteColumnResponse = columnClient.deleteColumn(board.id, createdColumn.id, participantContext);
    check(participantDeleteColumnResponse, {
      "verify regular participant delete column status is 403": (r) => r.status === 403
    });

    const ownerDeleteColumnResponse = columnClient.deleteColumn(board.id, createdColumn.id, ownerContext);
    check(ownerDeleteColumnResponse, {
      "verify owner delete column status is 204": (r) => r.status === 204
    });
  });

  group("Check notes", () => {
    const ownerContext = new http.CookieJar();
    const ownerRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Note-Owner-${Date.now()}` };
    const [owner] = authClient.loginAnonymous(ownerRequest, ownerContext);
    if (!owner) {
      return;
    }

    const authenticatedContext = new http.CookieJar();
    const authenticatedRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Note-Authenticated-${Date.now()}` };
    const [user] = authClient.loginAnonymous(authenticatedRequest, authenticatedContext);
    if (!user) {
      return;
    }

    const participantContext = new http.CookieJar();
    const participantRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Note-Participant-${Date.now()}` };
    const [participant] = authClient.loginAnonymous(participantRequest, participantContext);
    if (!participant) {
      return;
    }

    const createBoardRequest: CreateBoardRequest = {
      name: `E2E-Note-Test-${Date.now()}`,
      accessPolicy: "PUBLIC",
      columns: [
        { name: `E2E-Test-Note-1-${Date.now()}`, index: 0, color: "backlog-blue", visible: true },
        { name: `E2E-Test-Note-2-${Date.now()}`, index: 1, color: "online-orange", visible: true },
        { name: `E2E-Test-Note-3-${Date.now()}`, index: 2, color: "goal-green", visible: true }
      ]
    };
    const [board] = boardClient.createBoard(createBoardRequest, ownerContext);
    if (!board) {
      return;
    }

    const joinResponse = boardClient.joinBoard(board.id, {}, participantContext);
    check(joinResponse, {
      "verify board join status is 201": (r) => r.status === 201
    });

    const [columns] = columnClient.getColumns(board.id, ownerContext);
    if (!columns || columns.length < 3) {
      return;
    }

    const column1Id = columns[0].id;
    const column2Id = columns[1].id;
    const column3Id = columns[2].id;

    const noteRequest: CreateNoteRequest = {
      column: column1Id,
      text: "Test note"
    };

    const [, unauthenticatedCreateNoteResponse] = noteClient.createNote(board.id, noteRequest, new http.CookieJar());
    check(unauthenticatedCreateNoteResponse, {
      "verify unauthenticated create note status is 401": (r) => r.status === 401
    });

    const [, authenticatedCreateNoteResponse] = noteClient.createNote(board.id, noteRequest, authenticatedContext);
    check(authenticatedCreateNoteResponse, {
      "verify authenticated user create note status is 403": (r) => r.status === 403
    });

    const ownerNoteRequest: CreateNoteRequest = {
      column: column1Id,
      text: `Test note by owner ${Date.now()}`
    };

    const [ownerNote, ownerCreateNoteResponse] = noteClient.createNote(board.id, ownerNoteRequest, ownerContext);
    check(ownerCreateNoteResponse, {
      "verify owner create note status is 201": (r) => r.status === 201,
      "verify created note text matches": () => ownerNote?.text === ownerNoteRequest.text,
      "verify created note column matches": () => ownerNote?.position.column === column1Id,
      "verify created note author is owner": () => ownerNote?.author === owner.id
    });

    if (!ownerNote) {
      return;
    }

    const participantNoteRequest: CreateNoteRequest = {
      column: column2Id,
      text: `Test note by participant ${Date.now()}`
    };

    const [participantNote, participantCreateNoteResponse] = noteClient.createNote(board.id, participantNoteRequest, participantContext);
    check(participantCreateNoteResponse, {
      "verify participant create note status is 201": (r) => r.status === 201,
      "verify participant created note text matches": () => participantNote?.text === participantNoteRequest.text,
      "verify participant created note column matches": () => participantNote?.position.column === column2Id,
      "verify participant created note author is participant": () => participantNote?.author === participant.id
    });

    if (!participantNote) {
      return;
    }

    const [, unauthenticatedGetNotesResponse] = noteClient.getNotes(board.id, new http.CookieJar());
    check(unauthenticatedGetNotesResponse, {
      "verify unauthenticated get notes status is 401": (r) => r.status === 401
    });

    const [, authenticatedGetNotesResponse] = noteClient.getNotes(board.id, authenticatedContext);
    check(authenticatedGetNotesResponse, {
      "verify authenticated user get notes status is 403": (r) => r.status === 403
    });

    const [participantNotes, participantGetNotesResponse] = noteClient.getNotes(board.id, participantContext);
    check(participantGetNotesResponse, {
      "verify participant get notes status is 200": (r) => r.status === 200,
      "verify participant notes count is 2": () => participantNotes?.length === 2
    });

    const [ownerNotes, ownerGetNotesResponse] = noteClient.getNotes(board.id, ownerContext);
    check(ownerGetNotesResponse, {
      "verify owner get notes status is 200": (r) => r.status === 200,
      "verify owner notes count is 2": () => ownerNotes?.length === 2
    });

    const [, unauthenticatedGetNoteResponse] = noteClient.getNote(board.id, participantNote.id, new http.CookieJar());
    check(unauthenticatedGetNoteResponse, {
      "verify unauthenticated get note status is 401": (r) => r.status === 401
    });

    const [, authenticatedGetNoteResponse] = noteClient.getNote(board.id, participantNote.id, authenticatedContext);
    check(authenticatedGetNoteResponse, {
      "verify authenticated user get note status is 403": (r) => r.status === 403
    });

    const [getOwnerNote, participantGetOwnerNoteResponse] = noteClient.getNote(board.id, ownerNote.id, participantContext);
    check(participantGetOwnerNoteResponse, {
      "verify participant get owner note status is 200": (r) => r.status === 200,
      "verify get owner note id matches": () => getOwnerNote?.id === ownerNote.id,
      "verify get owner note text matches": () => getOwnerNote?.text === ownerNote.text
    });

    const [getParticipantNote, ownerGetParticipantNoteResponse] = noteClient.getNote(board.id, participantNote.id, ownerContext);
    check(ownerGetParticipantNoteResponse, {
      "verify owner get participant note status is 200": (r) => r.status === 200,
      "verify get participant note id matches": () => getParticipantNote?.id === participantNote.id,
      "verify get participant note text matches": () => getParticipantNote?.text === participantNote.text
    });

    const updateNoteRequest: UpdateNoteRequest = {
      text: "Test note updated",
      position: { column: column3Id, rank: 1 }
    };

    const [, unauthenticatedUpdateNoteResponse] = noteClient.updateNote(board.id, participantNote.id, updateNoteRequest, new http.CookieJar());
    check(unauthenticatedUpdateNoteResponse, {
      "verify unauthenticated update note status is 401": (r) => r.status === 401
    });

    const [, authenticatedUpdateNoteResponse] = noteClient.updateNote(board.id, participantNote.id, updateNoteRequest, authenticatedContext);
    check(authenticatedUpdateNoteResponse, {
      "verify authenticated user update note status is 403": (r) => r.status === 403
    });

    const participantUpdateNoteRequest: UpdateNoteRequest = {
      text: `Test note updated by participant ${Date.now()}`,
      position: { column: column3Id, rank: 1 }
    };

    const [participantUpdatedNote, participantUpdateNoteResponse] = noteClient.updateNote(board.id, participantNote.id, participantUpdateNoteRequest, participantContext);
    check(participantUpdateNoteResponse, {
      "verify participant update note status is 200": (r) => r.status === 200,
      "verify participant updated note text matches": () => participantUpdatedNote?.text === participantUpdateNoteRequest.text,
      "verify participant updated note column matches": () => participantUpdatedNote?.position.column === column3Id
    });

    const ownerUpdateNoteRequest: UpdateNoteRequest = {
      text: `Test note updated by owner ${Date.now()}`,
      position: { column: column3Id, rank: 2 }
    };

    const [ownerUpdatedNote, ownerUpdateNoteResponse] = noteClient.updateNote(board.id, ownerNote.id, ownerUpdateNoteRequest, ownerContext);
    check(ownerUpdateNoteResponse, {
      "verify owner update note status is 200": (r) => r.status === 200,
      "verify owner updated note text matches": () => ownerUpdatedNote?.text === ownerUpdateNoteRequest.text,
      "verify owner updated note column matches": () => ownerUpdatedNote?.position.column === column3Id
    });

    const deleteNoteRequest: DeleteNoteRequest = { deleteStack: false };
    const unauthenticatedDeleteNoteResponse = noteClient.deleteNote(board.id, participantNote.id, deleteNoteRequest, new http.CookieJar());
    check(unauthenticatedDeleteNoteResponse, {
      "verify unauthenticated delete note status is 401": (r) => r.status === 401
    });

    const authenticatedDeleteNoteResponse = noteClient.deleteNote(board.id, participantNote.id, deleteNoteRequest, authenticatedContext);
    check(authenticatedDeleteNoteResponse, {
      "verify non-participant delete note status is 403": (r) => r.status === 403
    });

    const participantDeleteNoteResponse = noteClient.deleteNote(board.id, participantNote.id, deleteNoteRequest, ownerContext);
    check(participantDeleteNoteResponse, {
      "verify participant note deletion status is 204": (r) => r.status === 204
    });

    const ownerDeleteNoteResponse = noteClient.deleteNote(board.id, ownerNote.id, deleteNoteRequest, ownerContext);
    check(ownerDeleteNoteResponse, {
      "verify owner note deletion status is 204": (r) => r.status === 204
    });
  });

  // sleep for joinBoard rate limit
  sleep(5);

  group("Check votings and votes", () => {
    const ownerContext = new http.CookieJar();
    const ownerRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Voting-Owner-${Date.now()}` };
    const [owner] = authClient.loginAnonymous(ownerRequest, ownerContext);
    if (!owner) {
      return;
    }

    const authenticatedContext = new http.CookieJar();
    const authenticatedRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Voting-Authenticated-${Date.now()}` };
    const [user] = authClient.loginAnonymous(authenticatedRequest, authenticatedContext);
    if (!user) {
      return;
    }

    const participantContext = new http.CookieJar();
    const participantRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Voting-Participant-${Date.now()}` };
    const [participant] = authClient.loginAnonymous(participantRequest, participantContext);
    if (!participant) {
      return;
    }

    const createBoardRequest: CreateBoardRequest = {
      name: `E2E-Voting-Test-${Date.now()}`,
      accessPolicy: "PUBLIC",
      columns: [
        { name: `E2E-Test-Voting-1-${Date.now()}`, index: 0, color: "backlog-blue", visible: true },
        { name: `E2E-Test-Voting-2-${Date.now()}`, index: 1, color: "online-orange", visible: true },
        { name: `E2E-Test-Voting-3-${Date.now()}`, index: 2, color: "goal-green", visible: true }
      ]
    };
    const [board] = boardClient.createBoard(createBoardRequest, ownerContext);
    if (!board) {
      return;
    }

    const joinResponse = boardClient.joinBoard(board.id, {}, participantContext);
    check(joinResponse, {
      "verify joinBoard status is 201": (r) => r.status === 201
    });

    const [columns] = columnClient.getColumns(board.id, ownerContext);
    if (!columns || columns.length < 3) {
      return;
    }

    const column1Id = columns[0].id;
    const column2Id = columns[1].id;
    const column3Id = columns[2].id;

    const [note1] = noteClient.createNote(board.id, { column: column1Id, text: "No way?" }, ownerContext);
    const [note2] = noteClient.createNote(board.id, { column: column1Id, text: "What?" }, participantContext);
    const [note3] = noteClient.createNote(board.id, { column: column2Id, text: "New idea" }, participantContext);
    const [note4] = noteClient.createNote(board.id, { column: column2Id, text: "Idea" }, ownerContext);
    const [note5] = noteClient.createNote(board.id, { column: column3Id, text: "Really new idea" }, participantContext);
    const [note6] = noteClient.createNote(board.id, { column: column3Id, text: "This is it" }, ownerContext);
    if (!note1 || !note2 || !note3 || !note4 || !note5 || !note6) {
      return;
    }

    const votingRequest: CreateVotingRequest = {
      voteLimit: 5,
      allowMultipleVotes: true,
      showVotesOfOthers: true,
      isAnonymous: false
    };

    const [, unauthenticatedCreateVotingResponse] = votingClient.createVoting(board.id, votingRequest, new http.CookieJar());
    check(unauthenticatedCreateVotingResponse, {
      "verify unauthenticated create voting status is 401": (r) => r.status === 401
    });

    const [, authenticatedCreateVotingResponse] = votingClient.createVoting(board.id, votingRequest, authenticatedContext);
    check(authenticatedCreateVotingResponse, {
      "verify authenticated user create voting status is 403": (r) => r.status === 403
    });

    const [, participantCreateVotingResponse] = votingClient.createVoting(board.id, votingRequest, participantContext);
    check(participantCreateVotingResponse, {
      "verify participant create voting status is 403": (r) => r.status === 403
    });

    const [voting, ownerCreateVotingRes] = votingClient.createVoting(board.id, votingRequest, ownerContext);
    check(ownerCreateVotingRes, {
      "verify owner create voting status is 201": (r) => r.status === 201,
      "verify voting status is OPEN": () => voting?.status === "OPEN",
      "verify voting vote limit is 5": () => voting?.voteLimit === 5
    });

    if (!voting) {
      return;
    }

    const [, unauthenticatedGetVotingsResponse] = votingClient.getVotings(board.id, new http.CookieJar());
    check(unauthenticatedGetVotingsResponse, {
      "verify unauthenticated get votings status is 401": (r) => r.status === 401
    });

    const [, authenticatedGetVotingsResponse] = votingClient.getVotings(board.id, authenticatedContext);
    check(authenticatedGetVotingsResponse, {
      "verify authenticated user get votings status is 403": (r) => r.status === 403
    });

    const [participantVotings, participantGetVotingsResponse] = votingClient.getVotings(board.id, participantContext);
    check(participantGetVotingsResponse, {
      "verify participant get votings status is 200": (r) => r.status === 200,
      "verify participant votings count is 1": () => participantVotings?.length === 1
    });

    const [ownerVotings, ownerGetVotingsResponse] = votingClient.getVotings(board.id, ownerContext);
    check(ownerGetVotingsResponse, {
      "verify owner get votings status is 200": (r) => r.status === 200,
      "verify owner votings count is 1": () => ownerVotings?.length === 1
    });

    const [, unauthenticatedGetVotingResponse] = votingClient.getVoting(board.id, voting.id, new http.CookieJar());
    check(unauthenticatedGetVotingResponse, {
      "verify unauthenticated get voting status is 401": (r) => r.status === 401
    });

    const [, authenticatedGetVotingResponse] = votingClient.getVoting(board.id, voting.id, authenticatedContext);
    check(authenticatedGetVotingResponse, {
      "verify authenticated user get voting status is 403": (r) => r.status === 403
    });

    const [participantVoting, participantGetVotingResponse] = votingClient.getVoting(board.id, voting.id, participantContext);
    check(participantGetVotingResponse, {
      "verify participant get voting status is 200": (r) => r.status === 200,
      "verify participant voting id matches": () => participantVoting?.id === voting.id,
      "verify participant voting status is OPEN": () => participantVoting?.status === "OPEN"
    });

    const [ownerVoting, ownerGetVotingResponse] = votingClient.getVoting(board.id, voting.id, ownerContext);
    check(ownerGetVotingResponse, {
      "verify owner get voting status is 200": (r) => r.status === 200,
      "verify owner voting id matches": () => ownerVoting?.id === voting.id,
      "verify owner voting status is OPEN": () => ownerVoting?.status === "OPEN"
    });

    const unauthenticatedVoteResponse = voteClient.createVote(board.id, { note: note1.id }, new http.CookieJar());
    check(unauthenticatedVoteResponse, {
      "verify unauthenticated create vote status is 401": (r) => r.status === 401
    });

    const authenticatedVoteResponse = voteClient.createVote(board.id, { note: note1.id }, authenticatedContext);
    check(authenticatedVoteResponse, {
      "verify authenticated user create vote status is 403": (r) => r.status === 403
    });

    const participantVote1Response = voteClient.createVote(board.id, { note: note1.id }, participantContext);
    check(participantVote1Response, {
      "verify participant vote 1 status is 201": (r) => r.status === 201
    });

    const participantVote2Response = voteClient.createVote(board.id, { note: note3.id }, participantContext);
    check(participantVote2Response, {
      "verify participant vote 2 status is 201": (r) => r.status === 201
    });

    const participantVote3Response = voteClient.createVote(board.id, { note: note5.id }, participantContext);
    check(participantVote3Response, {
      "verify participant vote 3 status is 201": (r) => r.status === 201
    });

    const ownerVote1Response = voteClient.createVote(board.id, { note: note2.id }, ownerContext);
    check(ownerVote1Response, {
      "verify owner vote 1 status is 201": (r) => r.status === 201
    });

    const ownerVote2Response = voteClient.createVote(board.id, { note: note4.id }, ownerContext);
    check(ownerVote2Response, {
      "verify owner vote 2 status is 201": (r) => r.status === 201
    });

    const ownerVote3Response = voteClient.createVote(board.id, { note: note6.id }, ownerContext);
    check(ownerVote3Response, {
      "verify owner vote 3 status is 201": (r) => r.status === 201
    });

    const [, unauthenticatedGetVotesResponse] = voteClient.getVotes(board.id, voting.id, null, new http.CookieJar());
    check(unauthenticatedGetVotesResponse, {
      "verify unauthenticated get votes status is 401": (r) => r.status === 401
    });

    const [, authenticatedGetVotesResponse] = voteClient.getVotes(board.id, voting.id, null, authenticatedContext);
    check(authenticatedGetVotesResponse, {
      "verify authenticated user get votes status is 403": (r) => r.status === 403
    });

    const [participantVotes, participantGetVotesResponse] = voteClient.getVotes(board.id, voting.id, null, participantContext);
    check(participantGetVotesResponse, {
      "verify participant get votes status is 200": (r) => r.status === 200,
      "verify participant votes count is 3": () => participantVotes?.length === 3
    });

    const [ownerVotes, ownerGetVotesResponse] = voteClient.getVotes(board.id, voting.id, null, ownerContext);
    check(ownerGetVotesResponse, {
      "verify owner get votes status is 200": (r) => r.status === 200,
      "verify owner votes count is 3": () => ownerVotes?.length === 3
    });

    const [noteVotes, noteVotesRes] = voteClient.getVotes(board.id, voting.id, note2.id, ownerContext);
    check(noteVotesRes, {
      "verify note votes status is 200": (r) => r.status === 200,
      "verify note votes count is 1": () => noteVotes?.length === 1
    });

    const unauthenticatedDeleteVoteResponse = voteClient.deleteVote(board.id, { note: note2.id }, new http.CookieJar());
    check(unauthenticatedDeleteVoteResponse, {
      "verify unauthenticated delete vote status is 401": (r) => r.status === 401
    });

    const authenticatedDeleteVoteResponse = voteClient.deleteVote(board.id, { note: note2.id }, authenticatedContext);
    check(authenticatedDeleteVoteResponse, {
      "verify authenticated user delete vote status is 403": (r) => r.status === 403
    });

    const participantDeleteVoteResponse = voteClient.deleteVote(board.id, { note: note3.id }, participantContext);
    check(participantDeleteVoteResponse, {
      "verify participant delete vote status is 204": (r) => r.status === 204
    });

    const ownerDeleteVoteResponse = voteClient.deleteVote(board.id, { note: note2.id }, ownerContext);
    check(ownerDeleteVoteResponse, {
      "verify owner delete vote status is 204": (r) => r.status === 204
    });

    const [, unauthenticatedCloseVotingResponse] = votingClient.closeVoting(board.id, voting.id, new http.CookieJar());
    check(unauthenticatedCloseVotingResponse, {
      "verify unauthenticated close voting status is 401": (r) => r.status === 401
    });

    const [, authenticatedCloseVotingResponse] = votingClient.closeVoting(board.id, voting.id, authenticatedContext);
    check(authenticatedCloseVotingResponse, {
      "verify authenticated user close voting status is 403": (r) => r.status === 403
    });

    const [, participantCloseVotingResponse] = votingClient.closeVoting(board.id, voting.id, participantContext);
    check(participantCloseVotingResponse, {
      "verify participant close voting status is 403": (r) => r.status === 403
    });

    const [closedVoting, ownerCloseVotingRes] = votingClient.closeVoting(board.id, voting.id, ownerContext);
    check(ownerCloseVotingRes, {
      "verify owner close voting status is 200": (r) => r.status === 200,
      "verify closed voting status is CLOSED": () => closedVoting?.status === "CLOSED"
    });
  });

  group("Check sessions and session requests", () => {
    const ownerContext = new http.CookieJar();
    const ownerRequest: AnonymousSignUpRequest = { name: `SessionOwner-${Date.now()}` };
    const [, ] = authClient.loginAnonymous(ownerRequest, ownerContext);

    const candidateContext = new http.CookieJar();
    const candidateRequest: AnonymousSignUpRequest = { name: `SessionCandidate-${Date.now()}` };
    const [candidate] = authClient.loginAnonymous(candidateRequest, candidateContext);
    if (!candidate) {
      return;
    }

    const createBoardRequest: CreateBoardRequest = {
      name: `E2E-Session-Test-${Date.now()}`,
      accessPolicy: "BY_INVITE",
      columns: []
    };
    const [board] = boardClient.createBoard(createBoardRequest, ownerContext);
    if (!board) {
      return;
    }

    const unauthenticatedJoinResponse = boardClient.joinBoard(board.id, {}, new http.CookieJar());
    check(unauthenticatedJoinResponse, {
      "verify unauthenticated join board with invite status is 401": (r) => r.status === 401
    });

    const candidateJoinResponse = boardClient.joinBoard(board.id, {}, candidateContext);
    check(candidateJoinResponse, {
      "verify candidate join board status is 200 or 201 or 303": (r) => r.status === 200 || r.status === 201 || r.status === 303
    });

    const [, unauthenticatedGetRequestsResponse] = sessionRequestClient.getBoardSessionRequests(board.id, null, new http.CookieJar());
    check(unauthenticatedGetRequestsResponse, {
      "verify unauthenticated get board session requests status is 401": (r) => r.status === 401
    });

    const [, candidateGetResponse] = sessionRequestClient.getBoardSessionRequests(board.id, null, candidateContext);
    check(candidateGetResponse, {
      "verify candidate get board session requests status is 403": (r) => r.status === 403
    });

    const [ownerSessionRequests, ownerGetResponse] = sessionRequestClient.getBoardSessionRequests(board.id, null, ownerContext);
    check(ownerGetResponse, {
      "verify owner get board session requests status is 200": (r) => r.status === 200,
      "verify owner session requests count is 1": () => ownerSessionRequests?.length === 1
    });

    const [, unauthenticatedGetRequestResponse] = sessionRequestClient.getBoardSessionRequest(board.id, candidate.id, new http.CookieJar());
    check(unauthenticatedGetRequestResponse, {
      "verify unauthenticated get board session request status is 401": (r) => r.status === 401
    });

    const [candidateGetRequest, candidateGetRequestResponse] = sessionRequestClient.getBoardSessionRequest(board.id, candidate.id, candidateContext);
    check(candidateGetRequestResponse, {
      "verify candidate get board session request status is 200": (r) => r.status === 200,
      "verify candidate request status is PENDING": () => candidateGetRequest?.status === "PENDING"
    });

    const [, unauthenticatedUpdateResponse] = sessionRequestClient.updateBoardSessionRequest(board.id, candidate.id, { status: "ACCEPTED" }, new http.CookieJar());
    check(unauthenticatedUpdateResponse, {
      "verify unauthenticated update board session request status is 401": (r) => r.status === 401
    });

    const [, candidateUpdateResponse] = sessionRequestClient.updateBoardSessionRequest(board.id, candidate.id, { status: "ACCEPTED" }, candidateContext);
    check(candidateUpdateResponse, {
      "verify candidate update board session request status is 403": (r) => r.status === 403
    });

    const [acceptedRequest, ownerUpdateRequestResponse] = sessionRequestClient.updateBoardSessionRequest(board.id, candidate.id, { status: "ACCEPTED" }, ownerContext);
    check(ownerUpdateRequestResponse, {
      "verify owner update board session request status is 200": (r) => r.status === 200,
      "verify accepted request status is ACCEPTED": () => acceptedRequest?.status === "ACCEPTED"
    });

    const [, unauthenticatedGetParticipantsResponse] = sessionClient.getParticipants(board.id, null, null, null, null, new http.CookieJar());
    check(unauthenticatedGetParticipantsResponse, {
      "verify unauthenticated get participants status is 401": (r) => r.status === 401
    });

    const [candidateSessions, candidateGetParticipantsResponse] = sessionClient.getParticipants(board.id, null, null, null, null, candidateContext);
    check(candidateGetParticipantsResponse, {
      "verify candidate get participants status is 200": (r) => r.status === 200,
      "verify candidate sessions count is 2": () => candidateSessions?.length === 2
    });

    const [ownerSessions, ownerGetParticipantsResponse] = sessionClient.getParticipants(board.id, null, null, null, null, ownerContext);
    check(ownerGetParticipantsResponse, {
      "verify owner get participants status is 200": (r) => r.status === 200,
      "verify owner sessions count is 2": () => ownerSessions?.length === 2
    });

    const [, unauthenticatedGetParticipantResponse] = sessionClient.getParticipant(board.id, candidate.id, new http.CookieJar());
    check(unauthenticatedGetParticipantResponse, {
      "verify unauthenticated get participant status is 401": (r) => r.status === 401
    });

    const [candidateSession, candidateGetParticipantResponse] = sessionClient.getParticipant(board.id, candidate.id, candidateContext);
    check(candidateGetParticipantResponse, {
      "verify candidate get participant status is 200": (r) => r.status === 200,
      "verify candidate session id matches": () => candidateSession?.id === candidate.id,
      "verify candidate session role is PARTICIPANT": () => candidateSession?.role === "PARTICIPANT"
    });

    const updateSessionReqest: BoardSessionUpdateRequest = {
      ready: true,
      raisedHand: true
    };

    const [, unauthenticatedUpdateParticipantResponse] = sessionClient.updateParticipant(board.id, candidate.id, updateSessionReqest, new http.CookieJar());
    check(unauthenticatedUpdateParticipantResponse, {
      "verify unauthenticated update participant status is 401": (r) => r.status === 401
    });

    const [updatedSession, participantUpdateResponse] = sessionClient.updateParticipant(board.id, candidate.id, updateSessionReqest, candidateContext);
    check(participantUpdateResponse, {
      "verify participant update participant status is 200": (r) => r.status === 200,
      "verify updated session is ready": () => updatedSession?.ready === true,
      "verify updated session raised hand": () => updatedSession?.raisedHand === true
    });

    const [promotedSession, ownerPromotedResponse] = sessionClient.updateParticipant(board.id, candidate.id, { role: "MODERATOR" }, ownerContext);
    check(ownerPromotedResponse, {
      "verify owner promote participant status is 200": (r) => r.status === 200,
      "verify promoted session role is MODERATOR": () => promotedSession?.role === "MODERATOR"
    });

    const bulkUpdateRequest: BoardSessionsUpdateRequest = { ready: false, raisedHand: false };
    const [, unauthenticatedBulkUpdateResponse] = sessionClient.updateParticipants(board.id, bulkUpdateRequest, new http.CookieJar());
    check(unauthenticatedBulkUpdateResponse, {
      "verify unauthenticated update participants status is 401": (r) => r.status === 401
    });

    const [bulkSessions, ownerBulkUpdateResponse] = sessionClient.updateParticipants(board.id, bulkUpdateRequest, ownerContext);
    check(ownerBulkUpdateResponse, {
      "verify owner update participants status is 200": (r) => r.status === 200,
      "verify sessions count is 2": () => bulkSessions?.length === 2
    });

    const unauthenticatedDeleteResponse = sessionClient.deleteParticipant(board.id, candidate.id, new http.CookieJar());
    check(unauthenticatedDeleteResponse, {
      "verify unauthenticated delete participant status is 401": (r) => r.status === 401
    });

    const candidateDeleteResponse = sessionClient.deleteParticipant(board.id, candidate.id, candidateContext);
    check(candidateDeleteResponse, {
      "verify candidate delete participant status is 204": (r) => r.status === 204
    });
  });

  group("Check reactions", () => {
    const ownerContext = new http.CookieJar();
    const ownerRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Reaction-Owner-${Date.now()}` };
    const [owner] = authClient.loginAnonymous(ownerRequest, ownerContext);
    if (!owner) {
      return;
    }

    const createBoardRequest: CreateBoardRequest = {
      name: `E2E-Reaction-Test-${Date.now()}`,
      accessPolicy: "PUBLIC",
      columns: [
        { name: "Column 1", color: "goal-green", visible: true, index: 0 }
      ]
    };
    const [board] = boardClient.createBoard(createBoardRequest, ownerContext);
    if (!board) {
      return;
    }

    const [cols] = columnClient.getColumns(board.id, ownerContext);
    if (!cols || cols.length !== 1) {
      return;
    }
    const colId = cols[0].id;

    const [note] = noteClient.createNote(board.id, { column: colId, text: "React Note" }, ownerContext);
    if (!note) {
      return;
    }

    const reactionRequest: CreateReactionRequest = {
      note: note.id,
      reactionType: "heart"
    };

    const [, unauthenticatedCreateReactionResponse] = reactionClient.createReaction(board.id, reactionRequest, new http.CookieJar());
    check(unauthenticatedCreateReactionResponse, {
      "verify unauthenticated create reaction status is 401": (r) => r.status === 401
    });

    const [createdReaction, ownerCreateReactRes] = reactionClient.createReaction(board.id, reactionRequest, ownerContext);
    check(ownerCreateReactRes, {
      "verify create reaction status is 201": (r) => r.status === 201,
      "verify created reaction type is heart": () => createdReaction?.reactionType === "heart",
      "verify created reaction note matches": () => createdReaction?.note === note.id,
      "verify created reaction user matches": () => createdReaction?.user === owner.id
    });

    if (!createdReaction) {
      return;
    }

    const [, unauthenticatedGetReactionsResponse] = reactionClient.getReactions(board.id, new http.CookieJar());
    check(unauthenticatedGetReactionsResponse, {
      "verify unauthenticated get reactions status is 401": (r) => r.status === 401
    });

    const [reactions, ownerGetReactionsResponse] = reactionClient.getReactions(board.id, ownerContext);
    check(ownerGetReactionsResponse, {
      "verify get reactions status is 200": (r) => r.status === 200,
      "verify reactions count is 1": () => reactions?.length === 1
    });

    const [, unauthenticatedGetReactionResponse] = reactionClient.getReaction(board.id, createdReaction.id, new http.CookieJar());
    check(unauthenticatedGetReactionResponse, {
      "verify unauthenticated get reaction status is 401": (r) => r.status === 401
    });

    const [reaction, ownerGetReactionResponse] = reactionClient.getReaction(board.id, createdReaction.id, ownerContext);
    check(ownerGetReactionResponse, {
      "verify get reaction status is 200": (r) => r.status === 200,
      "verify reaction id matches": () => reaction?.id === createdReaction.id,
      "verify reaction type is heart": () => reaction?.reactionType === "heart"
    });


    const [, unauthenticatedUpdateReactionResponse] = reactionClient.updateReaction(board.id, createdReaction.id, { reactionType: "joy" }, new http.CookieJar());
    check(unauthenticatedUpdateReactionResponse, {
      "verify unauthenticated update reaction status is 401": (r) => r.status === 401
    });

    const [updatedReaction, ownerUpdateReactionResponse] = reactionClient.updateReaction(board.id, createdReaction.id, { reactionType: "joy" }, ownerContext);
    check(ownerUpdateReactionResponse, {
      "verify update reaction status is 200": (r) => r.status === 200,
      "verify updated reaction type is joy": () => updatedReaction?.reactionType === "joy"
    });

    const unauthenticatedDeleteReactionResponse = reactionClient.deleteReaction(board.id, createdReaction.id, new http.CookieJar());
    check(unauthenticatedDeleteReactionResponse, {
      "verify unauthenticated delete reaction status is 401": (r) => r.status === 401
    });

    const ownerDeleteReactionResponse = reactionClient.deleteReaction(board.id, createdReaction.id, ownerContext);
    check(ownerDeleteReactionResponse, {
      "verify delete reaction status is 204": (r) => r.status === 204
    });
  });

  group("Check board reactions", () => {
    const ownerContext = new http.CookieJar();
    const ownerRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Board-Reaction-Owner-${Date.now()}` };
    const [owner] = authClient.loginAnonymous(ownerRequest, ownerContext);
    if (!owner) {
      return;
    }

    const authenticatedContext = new http.CookieJar();
    const authenticatedRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Voting-Authenticated-${Date.now()}` };
    const [user] = authClient.loginAnonymous(authenticatedRequest, authenticatedContext);
    if (!user) {
      return;
    }

    const createBoardRequest: CreateBoardRequest = {
      name: `E2E-Board-Reaction-Test-${Date.now()}`,
      accessPolicy: "PUBLIC",
      columns: []
    };

    const [board] = boardClient.createBoard(createBoardRequest, ownerContext);
    if (!board) {
      return;
    }

    const unauthenticatedBoardReactionResponse = boardReactionClient.createBoardReaction(board.id, { reactionType: "tada" }, new http.CookieJar());
    check(unauthenticatedBoardReactionResponse, {
      "verify unauthenticated create board reaction status is 401": (r) => r.status === 401
    });

    const authenticatedBoardReactionResponse = boardReactionClient.createBoardReaction(board.id, { reactionType: "tada" }, authenticatedContext);
    check(authenticatedBoardReactionResponse, {
      "verify authenticated create board reaction status is 403": (r) => r.status === 403
    });

    const ownerBoardReactionResponse = boardReactionClient.createBoardReaction(board.id, { reactionType: "tada" }, ownerContext);
    check(ownerBoardReactionResponse, {
      "verify owner create board reaction status is 201": (r) => r.status === 201
    });
  });


  group("Check board and column templates", () => {
    const userContext = new http.CookieJar();
    const userRequest: AnonymousSignUpRequest = { name: `Stan-E2E-Test-Template-Authenticated-${Date.now()}` };
    const [user] = authClient.loginAnonymous(userRequest, userContext);
    if (!user) {
      return;
    }

    const createTemplateRequest: CreateBoardTemplateRequest = {
      name: `E2E-Template-Test-${Date.now()}`,
      description: "Template description",
      favourite: false,
      columnTemplates: [
        { name: "Good", color: "goal-green", visible: true, index: 0 },
        { name: "Bad", color: "yielding-yellow", visible: true, index: 1 }
      ]
    };

    const [, unauthenticatedCreateTemplateResponse] = boardTemplateClient.createBoardTemplate(createTemplateRequest, new http.CookieJar());
    check(unauthenticatedCreateTemplateResponse, {
      "verify unauthenticated create board template status is 401": (r) => r.status === 401
    });

    const [createdTemplate, createTemplateResponse] = boardTemplateClient.createBoardTemplate(createTemplateRequest, userContext);
    check(createTemplateResponse, {
      "verify create board template status is 201": (r) => r.status === 201,
      "verify created template name matches": () => createdTemplate?.name === createTemplateRequest.name,
      "verify created template creator is user": () => createdTemplate?.creator === user.id,
      "verify created template favourite is false": () => createdTemplate?.favourite === false
    });

    if (!createdTemplate) {
      return;
    }

    const [, unauthenticatedGetTemplatesResponse] = boardTemplateClient.getBoardTemplates(new http.CookieJar());
    check(unauthenticatedGetTemplatesResponse, {
      "verify unauthenticated get board templates status is 401": (r) => r.status === 401
    });

    const [templates, getTemplatesResponse] = boardTemplateClient.getBoardTemplates(userContext);
    check(getTemplatesResponse, {
      "verify get board templates status is 200": (r) => r.status === 200,
      "verify count board templates is 1": () => templates?.length === 1,
      "verify get board templates contains created template": () => templates?.[0].template.id === createdTemplate.id
    });

    const [, unauthenticatedGetTemplateResponse] = boardTemplateClient.getBoardTemplate(createdTemplate.id, new http.CookieJar());
    check(unauthenticatedGetTemplateResponse, {
      "verify unauthenticated get board template status is 401": (r) => r.status === 401
    });

    const [template, getTemplateResponse] = boardTemplateClient.getBoardTemplate(createdTemplate.id, userContext);
    check(getTemplateResponse, {
      "verify get board template status is 200": (r) => r.status === 200,
      "verify template id matches": () => template?.id === createdTemplate.id,
      "verify template name matches": () => template?.name === createTemplateRequest.name
    });

    const updateTemplateRequest: UpdateBoardTemplateRequest = {
      name: `E2E-Template-Test-Updated-${Date.now()}`,
      description: "Updated template description",
      favourite: true
    };

    const [, unauthenticatedUpdateTemplateResponse] = boardTemplateClient.updateBoardTemplate(createdTemplate.id, updateTemplateRequest, new http.CookieJar());
    check(unauthenticatedUpdateTemplateResponse, {
      "verify unauthenticated update board template status is 401": (r) => r.status === 401
    });

    const [updatedTemplate, updateTemplateResponse] = boardTemplateClient.updateBoardTemplate(createdTemplate.id, updateTemplateRequest, userContext);
    check(updateTemplateResponse, {
      "verify update board template status is 200": (r) => r.status === 200,
      "verify updated template name matches": () => updatedTemplate?.name === updateTemplateRequest.name,
      "verify updated template is favourite": () => updatedTemplate?.favourite === true
    });

    const columnTemplateRequest: ColumnTemplateRequest = {
      name: "Action Items",
      color: "value-violet",
      visible: true,
      index: 2,
      description: "Action items column"
    };

    const [, unauthenticatedCreateColumnTemplateResponse] = columnTemplateClient.createColumnTemplate(createdTemplate.id, columnTemplateRequest, new http.CookieJar());
    check(unauthenticatedCreateColumnTemplateResponse, {
      "verify unauthenticated create column template status is 401": (r) => r.status === 401
    });

    const [createdColumnTemplate, createColumnTemplateResponse] = columnTemplateClient.createColumnTemplate(createdTemplate.id, columnTemplateRequest, userContext);
    check(createColumnTemplateResponse, {
      "verify create column template status is 201": (r) => r.status === 201,
      "verify created column template name matches": () => createdColumnTemplate?.name === columnTemplateRequest.name,
      "verify created column template color matches": () => createdColumnTemplate?.color === columnTemplateRequest.color
    });

    if (!createdColumnTemplate) {
      return;
    }

    const [, unauthenticatedGetColumnTemplates] = columnTemplateClient.getColumnTemplates(createdTemplate.id, new http.CookieJar());
    check(unauthenticatedGetColumnTemplates, {
      "verify unauthenticated get column templates status is 401": (r) => r.status === 401
    });

    const [columnTemplates, getColumnTemplatesResponse] = columnTemplateClient.getColumnTemplates(createdTemplate.id, userContext);
    check(getColumnTemplatesResponse, {
      "verify get column templates status is 200": (r) => r.status === 200,
      "verify column templates count is 3": () => columnTemplates?.length === 3
    });

    const [, unauthenticatedGetColumnTemplateResponse] = columnTemplateClient.getColumnTemplate(createdTemplate.id, createdColumnTemplate.id, new http.CookieJar());
    check(unauthenticatedGetColumnTemplateResponse, {
      "verify unauthenticated get column template status is 401": (r) => r.status === 401
    });

    const [columnTemplate, getColumnTemplateResponse] = columnTemplateClient.getColumnTemplate(createdTemplate.id, createdColumnTemplate.id, userContext);
    check(getColumnTemplateResponse, {
      "verify get column template status is 200": (r) => r.status === 200,
      "verify column template id matches": () => columnTemplate?.id === createdColumnTemplate.id,
      "verify column template name matches": () => columnTemplate?.name === "Action Items"
    });

    const updateColumnTemplateRequset: ColumnTemplateRequest = {
      name: "Action Items (Updated)",
      color: "online-orange",
      visible: true,
      index: 2,
      description: "Updated description"
    };

    const [, unauthenticatedUpdateColumnTemplate] = columnTemplateClient.updateColumnTemplate(createdTemplate.id, createdColumnTemplate.id, updateColumnTemplateRequset, new http.CookieJar());
    check(unauthenticatedUpdateColumnTemplate, {
      "verify unauthenticated update column template status is 401": (r) => r.status === 401
    });

    const [updatedColumnTemplate, updateColumnTemplateResponse] = columnTemplateClient.updateColumnTemplate(createdTemplate.id, createdColumnTemplate.id, updateColumnTemplateRequset, userContext);
    check(updateColumnTemplateResponse, {
      "verify update column template status is 200": (r) => r.status === 200,
      "verify updated column template name matches": () => updatedColumnTemplate?.name === "Action Items (Updated)",
      "verify updated column template color matches": () => updatedColumnTemplate?.color === "online-orange"
    });

    const unauthenticatedDeleteColumnTemplateResponse = columnTemplateClient.deleteColumnTemplate(createdTemplate.id, createdColumnTemplate.id, new http.CookieJar());
    check(unauthenticatedDeleteColumnTemplateResponse, {
      "verify unauthenticated delete column template status is 401": (r) => r.status === 401
    });

    const deleteColumnTemplateResponse = columnTemplateClient.deleteColumnTemplate(createdTemplate.id, createdColumnTemplate.id, userContext);
    check(deleteColumnTemplateResponse, {
      "verify delete column template status is 204": (r) => r.status === 204
    });

    const unauthenticatedDeleteTemplateResponse = boardTemplateClient.deleteBoardTemplate(createdTemplate.id, new http.CookieJar());
    check(unauthenticatedDeleteTemplateResponse, {
      "verify unauthenticated delete board template status is 401": (r) => r.status === 401
    });

    const deleteTemplateResponse = boardTemplateClient.deleteBoardTemplate(createdTemplate.id, userContext);
    check(deleteTemplateResponse, {
      "verify delete board template status is 204": (r) => r.status === 204
    });
  });
}
