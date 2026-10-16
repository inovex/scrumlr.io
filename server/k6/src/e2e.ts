import { check, group } from "k6";
import http from "k6/http";
import { AuthClient } from "./api/auth/api.ts";
import type { AnonymousSignUpRequest } from "./api/auth/requests.ts";
import { BoardClient } from "./api/board/api.ts";
import type {
	CreateBoardRequest,
	JoinBoardRequest,
	SetTimerRequest,
	UpdateBoardRequest,
} from "./api/board/requests.ts";
import { BoardReactionClient } from "./api/boardReaction/api.ts";
import { BoardTemplateClient } from "./api/boardTemplate/api.ts";
import type { CreateBoardTemplateRequest, UpdateBoardTemplateRequest } from "./api/boardTemplate/requests.ts";
import { ColumnClient } from "./api/column/api.ts";
import type { CreateColumnRequest, UpdateColumnRequest } from "./api/column/requests.ts";
import { ColumnTemplateClient } from "./api/columnTemplate/api.ts";
import type { ColumnTemplateRequest } from "./api/columnTemplate/requests.ts";
import { FeedbackClient } from "./api/feedback/api.ts";
import type { CreateFeedbackRequest } from "./api/feedback/requests.ts";
import { HealthClient } from "./api/health/api.ts";
import { InfoClient } from "./api/info/api.ts";
import { NoteClient } from "./api/note/api.ts";
import type { CreateNoteRequest, DeleteNoteRequest, UpdateNoteRequest } from "./api/note/requests.ts";
import { ReactionClient } from "./api/reaction/api.ts";
import type { CreateReactionRequest } from "./api/reaction/requests.ts";
import { SessionClient } from "./api/session/api.ts";
import type { BoardSessionsUpdateRequest, BoardSessionUpdateRequest } from "./api/session/requests.ts";
import { SessionRequestClient } from "./api/sessionRequest/api.ts";
import { UserClient } from "./api/user/api.ts";
import type { UpdateUserRequest } from "./api/user/requests.ts";
import { VoteClient } from "./api/vote/api.ts";
import { VotingClient } from "./api/voting/api.ts";
import type { CreateVotingRequest } from "./api/voting/requests.ts";
import { options } from "./options.ts";
import type { Board } from "./types/board.ts";
import type { BoardTemplate } from "./types/boardTemplate.ts";
import type { Column } from "./types/column.ts";
import type { ColumnTemplate } from "./types/columnTemplate.ts";
import type { Note } from "./types/note.ts";
import type { Reaction } from "./types/reaction.ts";
import type { Voting } from "./types/voting.ts";

export { options };

export default function e2e() {
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

	group("Health endpoints", () => {
		group("GET /health returns 204", () => {
			group("returns 204", () => {
				const response = healthClient.getHealth();

				check(response, {
					"verify health status is 204": (r) => r.status === 204,
				});
			});
		});
	});

	group("Info endpoints", () => {
		group("GET /info returns 200", () => {
			group("returns 200", () => {
				const [info, response] = infoClient.getInfo();

				check(response, {
					"verify info status is 200": (r) => r.status === 200,
					"verify info body is defined": () => info !== null && info !== undefined,
				});
			});
		});
	});

	group("Feedback endpoints", () => {
		const [info] = infoClient.getInfo();
		if (!info?.feedbackEnabled) {
			// Don't run the tests if feedback is not configured
			return;
		}

		group("POST /feedback", () => {
			group("bug report returns 201", () => {
				const bugFeedback: CreateFeedbackRequest = {
					text: "I have found a bug",
					type: "BUG_REPORT",
					contact: "load-test-bug@scrumlr.io",
				};

				const bugResponse = feedbackClient.sendFeedback(bugFeedback);

				check(bugResponse, {
					"verify bug response status is 201": (r) => r.status === 201,
				});
			});

			group("feature request returns 201", () => {
				const featureRequestFeedback: CreateFeedbackRequest = {
					text: "I want feature xyz",
					type: "FEATURE_REQUEST",
					contact: "load-test-feat-request@scrumlr.io",
				};

				const featureResponse = feedbackClient.sendFeedback(featureRequestFeedback);

				check(featureResponse, {
					"verify feature response status is 201": (r) => r.status === 201,
				});
			});

			group("POST /feedback praise returns 201", () => {
				const praiseFeedback: CreateFeedbackRequest = {
					text: "Thanks",
					type: "PRAISE",
					contact: "load-test-praise@scrumlr.io",
				};

				const praiseResponse = feedbackClient.sendFeedback(praiseFeedback);

				check(praiseResponse, {
					"verify praise response status is 201": (r) => r.status === 201,
				});
			});
		});
	});

	group("Authentication endpoints", () => {
		const anonymousContext = new http.CookieJar();

		group("POST /login/anonymous", () => {
			group("returns 201 and creates new anonymous user", () => {
				const anonymousName = `Stan-E2E-Test-Login-${Date.now()}`;
				const anonymousRequest: AnonymousSignUpRequest = { name: anonymousName };

				const [anonymousUser, authResponse] = authClient.loginAnonymous(anonymousRequest, anonymousContext);

				check(authResponse, {
					"verify anonymous login status is 201": (r) => r.status === 201,
					"verify anonymous login body is defined": () => anonymousUser !== null && anonymousUser !== undefined,
					"verify user is anonymous": () => anonymousUser?.accountType === "ANONYMOUS",
					"verify user name": () => anonymousUser?.name === anonymousName,
				});
			});

			group("returns 201 and creates new anonymous user with trimmed name", () => {
				const trimmedUserContext = new http.CookieJar();
				const trimmedNameRequest: AnonymousSignUpRequest = { name: "  John Doe  " };

				const [trimmedNameUser, trimmedNameResponse] = authClient.loginAnonymous(
					trimmedNameRequest,
					trimmedUserContext,
				);

				check(trimmedNameResponse, {
					"verify create trimmed name user status is 201": (r) => r.status === 201,
					"verify trimmed name user body is defined": (r) => r.body !== null && r.body !== undefined,
					"verify trimmed user account type is anonymous": () => trimmedNameUser?.accountType === "ANONYMOUS",
					"verify trimmed user name is John Doe": () => trimmedNameUser?.name === "John Doe",
				});
			});

			group("returns 500 with invalid name", () => {
				const invalidNameRequest: AnonymousSignUpRequest = {
					name: "No Name\nHello",
				};

				const [, invalidNameResponse] = authClient.loginAnonymous(invalidNameRequest);

				check(invalidNameResponse, {
					"verify invalid name response status is 500": (r) => r.status === 500,
				});
			});
		});

		group("DELETE /login", () => {
			group("returns 204", () => {
				const logoutResponse = authClient.logout(anonymousContext);

				check(logoutResponse, {
					"verify logout response status is 204": (r) => r.status === 204,
				});
			});
		});
	});

	group("Users endpoints", () => {
		const userContext = new http.CookieJar();
		const userRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Users-${Date.now()}`,
		};

		const [user] = authClient.loginAnonymous(userRequest, userContext);
		if (!user) {
			check(user, { "failed to create user": () => false });
			return;
		}

		const secondUserContext = new http.CookieJar();
		const secondUserRequest: AnonymousSignUpRequest = {
			name: `Stan-Load-Test-${Date.now()}`,
		};

		const [secondUser] = authClient.loginAnonymous(secondUserRequest, secondUserContext);
		if (!secondUser) {
			check(user, { "failed to create user": () => false });
			return;
		}

		group("GET /users", () => {
			group("with an unauthenticated user returns 401", () => {
				const [, unauthenticatedCurrentUserResponse] = userClient.getCurrentUser(new http.CookieJar());

				check(unauthenticatedCurrentUserResponse, {
					"verify get unauthenticated user status is 401": (r) => r.status === 401,
				});
			});

			group("with an authenticated user returns 200 and the authenticated user", () => {
				const [currentUser, currentUserResponse] = userClient.getCurrentUser(userContext);

				check(currentUserResponse, {
					"verify get user status is 200": (r) => r.status === 200,
					"verify get user id matches": () => currentUser?.id === user.id,
				});
			});
		});

		group("GET /users/{id}", () => {
			group("with an unauthenticated user returns 401", () => {
				const [, unauthenticatedGetUserResponse] = userClient.getUserById(user.id, new http.CookieJar());

				check(unauthenticatedGetUserResponse, {
					"verify unauthenticated get user status is 401": (r) => r.status === 401,
				});
			});

			group("returns 200 and the same user", () => {
				const [requestedUser, userResponse] = userClient.getUserById(user.id, userContext);

				check(userResponse, {
					"verify get own user status is 200": (r) => r.status === 200,
					"verify get own user id matches": () => requestedUser?.id === user.id,
				});
			});

			group("returns 200 and the requested other user", () => {
				const [requestedUser, userResponse] = userClient.getUserById(secondUser.id, userContext);

				check(userResponse, {
					"verify get different user status is 200": (r) => r.status === 200,
					"verify get different user id matches": () => requestedUser?.id === secondUser?.id,
				});
			});
		});

		group("PUT /users", () => {
			group("with unauthenticated user returns 401", () => {
				const updatedName = `Stan-Load-Test-${Date.now()}`;
				const updateUserRequest: UpdateUserRequest = { name: updatedName };

				const [, unauthenticatedUserUpdateResponse] = userClient.updateUser(updateUserRequest, new http.CookieJar());

				check(unauthenticatedUserUpdateResponse, {
					"verify unauthenticated update user status is 401": (r) => r.status === 401,
				});
			});

			group("returns 200 and the updated user", () => {
				const updatedName = `Stan-Load-Test-${Date.now()}`;
				const updateUserRequest: UpdateUserRequest = { name: updatedName };

				const [updatedUser, updateUserResponse] = userClient.updateUser(updateUserRequest, userContext);

				check(updateUserResponse, {
					"verify user update status is 200": (r) => r.status === 200,
					"verify updated user id matches": () => updatedUser?.id === user.id,
					"verify updated user name matches": () => updatedUser?.name === updatedName,
				});
			});
		});

		group("DELETE /users/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const unauthenticatedDeleteUserResponse = userClient.deleteUser(secondUser.id, new http.CookieJar());

				check(unauthenticatedDeleteUserResponse, {
					"verify delete unauthenticated status is 401": (r) => r.status === 401,
				});
			});

			group("returns 204", () => {
				const deleteUserResponse = userClient.deleteUser(user.id, userContext);

				check(deleteUserResponse, {
					"verify delete user status is 204": (r) => r.status === 204,
				});
			});
		});
	});

	group("Board endpoints", () => {
		const ownerContext = new http.CookieJar();
		const ownerRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Board-Owner-${Date.now()}`,
		};
		const [,] = authClient.loginAnonymous(ownerRequest, ownerContext);

		const participantContext = new http.CookieJar();
		const participantRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Board-Participant-${Date.now()}`,
		};
		const [,] = authClient.loginAnonymous(participantRequest, participantContext);

		const boardName = `E2E-Board-Test-${Date.now()}`;
		const createBoardRequest: CreateBoardRequest = {
			name: boardName,
			description: "This is the best description of a board, or not",
			accessPolicy: "PUBLIC",
			columns: [
				{
					name: `E2E-Test-Board-1-${Date.now()}`,
					index: 0,
					color: "backlog-blue",
					visible: true,
				},
				{
					name: `E2E-Test-Board-2-${Date.now()}`,
					index: 1,
					color: "online-orange",
					visible: true,
				},
				{
					name: `E2E-Test-Board-3-${Date.now()}`,
					index: 2,
					color: "goal-green",
					visible: false,
				},
			],
		};

		let boardId: string | undefined;

		group("POST /boards", () => {
			group("with unauthenticated user returns 401", () => {
				const [, CreateResponse] = boardClient.createBoard(createBoardRequest, new http.CookieJar());

				check(CreateResponse, {
					"verify unauthenticated create board status is 401": (r) => r.status === 401,
				});
			});

			group("POST /boards returns 201 and created public board", () => {
				const [board, boardResponse] = boardClient.createBoard(createBoardRequest, ownerContext);

				check(boardResponse, {
					"verify board created status is 201": (r) => r.status === 201,
					"verify created board access policy is PUBLIC": () => board?.accessPolicy === "PUBLIC",
					"verify created board name matches": () => board?.name === boardName,
				});

				boardId = board?.id;
			});
		});

		if (!boardId) {
			check(boardId, { "failed to create public board": () => false });
			return;
		}

		group("GET /boards", () => {
			group("with unauthenticated user returns 401", () => {
				const [, boardResponse] = boardClient.getBoards(new http.CookieJar());

				check(boardResponse, {
					"verify unauthenticated get boards status is 401": (r) => r.status === 401,
				});
			});

			group("with owner returns 200 and board", () => {
				const [boards, boardResponse] = boardClient.getBoards(ownerContext);

				check(boardResponse, {
					"verify owner get boards status is 200": (r) => r.status === 200,
					"verify owner get boards count is 1": () => boards?.length === 1,
				});
			});

			group("with participant that did not join a board returns 200 and no boards", () => {
				const [boards, boardresponse] = boardClient.getBoards(participantContext);

				check(boardresponse, {
					"verify participant get boards status is 200": (r) => r.status === 200,
					"verify participant get boards count is 0": () => boards?.length === 0,
				});
			});
		});

		group("GET /boards/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const [, boardresponse] = boardClient.getBoard(boardId!, new http.CookieJar());

				check(boardresponse, {
					"verify unauthenticated get board status is 401": (r) => r.status === 401,
				});
			});

			group("GET /boards/{id} with owner return 200 and board", () => {
				const [board, boardResponse] = boardClient.getBoard(boardId!, ownerContext);

				check(boardResponse, {
					"verify owner get board status is 200": (r) => r.status === 200,
					"verify board get name matches": () => board?.name === boardName,
				});
			});

			group("GET /boards/{id} with authenticated user that did not join the board returns 403", () => {
				const [, boardResponse] = boardClient.getBoard(boardId!, participantContext);

				check(boardResponse, {
					"verify participant get board before join status is 403": (r) => r.status === 403,
				});
			});
		});

		group("GET /users/boards/{id}", () => {
			group("with owner returns 200 and users", () => {
				const [users, boardUsersResponse] = boardClient.getBoardUsers(boardId!, ownerContext);

				check(boardUsersResponse, {
					"verify owner get board users status is 200": (r) => r.status === 200,
					"verify initial board users count is 1": () => users?.length === 1,
				});
			});
		});

		group("POST /boards/{id}/participants ", () => {
			group("with unauthenticated user returns 401", () => {
				const joinRequest: JoinBoardRequest = {};

				const joinResponse = boardClient.joinBoard(boardId!, joinRequest, new http.CookieJar());

				check(joinResponse, {
					"verify unauthenticated join board status is 401": (r) => r.status === 401,
				});

				const [boardUsers, boardUserResponse] = boardClient.getBoardUsers(boardId!, ownerContext);

				check(boardUserResponse, {
					"verify board users status is 200": (r) => r.status === 200,
					"verify board users count is 1": () => boardUsers?.length === 1,
				});
			});

			group("with authenticated user returns 201", () => {
				const joinRequest: JoinBoardRequest = {};

				const joinResponse = boardClient.joinBoard(boardId!, joinRequest, participantContext);

				check(joinResponse, {
					"verify participant join board status is 201": (r) => r.status === 201,
				});

				const [boardUsers, boardUsersResponse] = boardClient.getBoardUsers(boardId!, ownerContext);

				check(boardUsersResponse, {
					"verify board users status is 200": (r) => r.status === 200,
					"verify board users count is 2": () => boardUsers?.length === 2,
				});
			});
		});

		let timerBoard: Board | null = null;

		group("POST /boards/{id}/timer", () => {
			group("with authenticated user returns 401", () => {
				const timerRequest: SetTimerRequest = { minutes: 3 };

				const [, boardTimerResponse] = boardClient.setTimer(boardId!, timerRequest, participantContext);

				check(boardTimerResponse, {
					"verify participant set timer status is 403": (r) => r.status === 403,
				});
			});

			group("with owner returns 200 and sets timer", () => {
				const timerRequest: SetTimerRequest = { minutes: 3 };

				const [board, boardTimerResponse] = boardClient.setTimer(boardId!, timerRequest, ownerContext);

				check(boardTimerResponse, {
					"verify owner set timer status is 200": (r) => r.status === 200,
					"verify timer start is defined": () => board?.timerStart !== undefined && board?.timerStart !== null,
					"verify timer end is defined": () => board?.timerEnd !== undefined && board?.timerEnd !== null,
				});

				timerBoard = board;
			});
		});

		group("POST /boards/{id}/timer/increment", () => {
			group("wit authenticated user returns 403", () => {
				const [, boardTimerResponse] = boardClient.incrementTimer(boardId!, participantContext);

				check(boardTimerResponse, {
					"verify participant increment timer status is 403": (r) => r.status === 403,
				});
			});

			group("with owner returns 200 and increments timer", () => {
				const [board, boardTimerResponse] = boardClient.incrementTimer(boardId!, ownerContext);

				check(boardTimerResponse, {
					"verify owner increment timer status is 200": (r) => r.status === 200,
					"verify increment timer timer start matches": () => board?.timerStart === timerBoard?.timerStart,
					"verify increment timer timer end is updated": () => board?.timerEnd !== timerBoard?.timerEnd,
				});
			});
		});

		group("DELETE /boards/{id}/timer with authenticated user returns 403", () => {
			group("", () => {
				const [, boardTimerResponse] = boardClient.deleteTimer(boardId!, participantContext);

				check(boardTimerResponse, {
					"verify participant delete timer status is 403": (r) => r.status === 403,
				});
			});

			group("with owner returns 200 and deletes the timer", () => {
				const [board, boardTimerResponse] = boardClient.deleteTimer(boardId!, ownerContext);

				check(boardTimerResponse, {
					"verify owner delete timer status is 200": (r) => r.status === 200,
					"verify timer start is cleared": () => board?.timerStart === undefined || board?.timerStart === null,
					"verify timer end is cleared": () => board?.timerEnd === undefined || board?.timerEnd === null,
				});
			});
		});

		group("GET /boards/{id}/export", () => {
			group("with unauthenticated user returns 401", () => {
				const exportResponse = boardClient.exportBoard(boardId!, new http.CookieJar());

				check(exportResponse, {
					"verify unauthenticated export board status is 401": (r) => r.status === 401,
				});
			});

			group("GET /boards/{id}/export with owner returns 200", () => {
				const exportResponse = boardClient.exportBoard(boardId!, ownerContext, { Accept: "application/json" });

				check(exportResponse, {
					"verify export board JSON status is 200": (r) => r.status === 200,
				});
			});

			group("GET /boards/{id}/export with owner as csv returns 200", () => {
				const exportResponse = boardClient.exportBoard(boardId!, ownerContext, { Accept: "text/csv" });

				check(exportResponse, {
					"verify export board CSV status is 200": (r) => r.status === 200,
				});
			});
		});

		group("PUT /boards/{id}", () => {
			const updatedName = `E2E-Board-Test-Updated-${Date.now()}`;
			const boardUpdateRequest: UpdateBoardRequest = {
				name: updatedName,
				isLocked: true,
			};

			group("with authenticated user returns 403", () => {
				const [, updateResponse] = boardClient.updateBoard(boardId!, boardUpdateRequest, participantContext);

				check(updateResponse, {
					"verify participant update board status is 403": (r) => r.status === 403,
				});
			});

			group("PUT /boards/{id} with owner returns 200 and updated board", () => {
				const [board, updateResponse] = boardClient.updateBoard(boardId!, boardUpdateRequest, ownerContext);

				check(updateResponse, {
					"verify owner update board status is 200": (r) => r.status === 200,
					"verify updated board name matches": () => board?.name === updatedName,
					"verify updated board is locked": () => board?.isLocked === true,
				});
			});
		});

		group("with authenticated user returns 403", () => {
			group("", () => {
				const deleteResponse = boardClient.deleteBoard(boardId!, participantContext);

				check(deleteResponse, {
					"verify participant delete board status is 403": (r) => r.status === 403,
				});
			});

			group("with owner returns 204", () => {
				const deleteResponse = boardClient.deleteBoard(boardId!, ownerContext);

				check(deleteResponse, {
					"verify owner delete board status is 204": (r) => r.status === 204,
				});
			});
		});
	});

	group("Column endpoints", () => {
		const ownerContext = new http.CookieJar();
		const ownerRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Column-Owner-${Date.now()}`,
		};
		const [,] = authClient.loginAnonymous(ownerRequest, ownerContext);

		const authenticatedContext = new http.CookieJar();
		const authenticatedRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Column-Authenticated-${Date.now()}`,
		};
		const [,] = authClient.loginAnonymous(authenticatedRequest, authenticatedContext);

		const participantContext = new http.CookieJar();
		const participantRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Column-Participant-${Date.now()}`,
		};
		const [,] = authClient.loginAnonymous(participantRequest, participantContext);

		const createBoardRequest: CreateBoardRequest = {
			name: `E2E-Column-Test-${Date.now()}`,
			accessPolicy: "PUBLIC",
			columns: [
				{
					name: `E2E-Test-Column-1-${Date.now()}`,
					index: 0,
					color: "backlog-blue",
					visible: true,
				},
				{
					name: `E2E-Test-Column-2-${Date.now()}`,
					index: 1,
					color: "online-orange",
					visible: true,
				},
				{
					name: `E2E-Test-Column-3-${Date.now()}`,
					index: 2,
					color: "goal-green",
					visible: false,
				},
			],
		};
		const [board] = boardClient.createBoard(createBoardRequest, ownerContext);
		if (!board) {
			check(board, { "failed to create board": () => false });
			return;
		}

		const joinResponse = boardClient.joinBoard(board.id, {}, participantContext);
		check(joinResponse, {
			"verify joinBoard status is 201": (r) => r.status === 201,
		});

		const createColumnRequest: CreateColumnRequest = {
			name: `E2E-Test-Column-Created-${Date.now()}`,
			color: "poker-purple",
			visible: true,
			index: 4,
			description: "Things that went well",
		};

		let createdColumn: Column | null = null;

		group("POST /boards/{id}/columns", () => {
			group("with unauthenticated user returns 401", () => {
				const [, columnResponse] = columnClient.createColumn(board.id, createColumnRequest, new http.CookieJar());

				check(columnResponse, {
					"verify unauthenticated create column status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user returns 403", () => {
				const [, columnResponse] = columnClient.createColumn(board.id, createColumnRequest, authenticatedContext);

				check(columnResponse, {
					"verify authenticated user create column status is 403": (r) => r.status === 403,
				});
			});

			group("with participant returns 403", () => {
				const [, columnResponse] = columnClient.createColumn(board.id, createColumnRequest, participantContext);

				check(columnResponse, {
					"verify participant create column status is 403": (r) => r.status === 403,
				});
			});

			group("with owner returns 201 and created column", () => {
				const [column, columnResponse] = columnClient.createColumn(board.id, createColumnRequest, ownerContext);

				check(columnResponse, {
					"verify owner create column status is 201": (r) => r.status === 201,
					"verify created column name matches": () => column?.name === createColumnRequest.name,
					"verify created column color matches": () => column?.color === createColumnRequest.color,
					"verify created column visible is true": () => column?.visible === true,
					"verify created column index is 3": () => column?.index === 3,
				});

				createdColumn = column;
			});
		});

		if (!createdColumn) {
			check(createdColumn, { "failed to create column": () => false });
			return;
		}

		group("GET /boards/{id}/columns", () => {
			group("with unauthenticated user return 401", () => {
				const [, columnResponse] = columnClient.getColumns(board.id, new http.CookieJar());

				check(columnResponse, {
					"verify unauthenticated get columns status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user return 403", () => {
				const [, columnResponse] = columnClient.getColumns(board.id, authenticatedContext);

				check(columnResponse, {
					"verify authenticated user get columns status is 403": (r) => r.status === 403,
				});
			});

			group("with participant return 200 and columns", () => {
				const [columns, columnResponse] = columnClient.getColumns(board.id, participantContext);

				check(columnResponse, {
					"verify participant get columns status is 200": (r) => r.status === 200,
					"verify participant columns count is 4": () => columns?.length === 4,
				});
			});

			group("with owner return 200 and columns", () => {
				const [columns, columnResponse] = columnClient.getColumns(board.id, ownerContext);

				check(columnResponse, {
					"verify owner get columns status is 200": (r) => r.status === 200,
					"verify owner columns count is 4": () => columns?.length === 4,
				});
			});
		});

		group("GET /boards/{id}/columns/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const [, columnResponse] = columnClient.getColumn(board.id, createdColumn!.id, new http.CookieJar());

				check(columnResponse, {
					"verify unauthenticated get column status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user returns 403", () => {
				const [, columnResponse] = columnClient.getColumn(board.id, createdColumn!.id, authenticatedContext);

				check(columnResponse, {
					"verify authenticated user get column status is 403": (r) => r.status === 403,
				});
			});

			group("with participant returns 200 and column", () => {
				const [column, columnResponse] = columnClient.getColumn(board.id, createdColumn!.id, participantContext);

				check(columnResponse, {
					"verify participant get column status is 200": (r) => r.status === 200,
					"verify participant column id matches": () => column?.id === createdColumn!.id,
					"verify participant column name matches": () => column?.name === createdColumn!.name,
				});
			});

			group("with owner returns 200 and column", () => {
				const [column, columnResponse] = columnClient.getColumn(board.id, createdColumn!.id, ownerContext);

				check(columnResponse, {
					"verify owner get column status is 200": (r) => r.status === 200,
					"verify owner column id matches": () => column?.id === createdColumn!.id,
					"verify owner column name matches": () => column?.name === createdColumn!.name,
				});
			});
		});

		const updateColumnRequest: UpdateColumnRequest = {
			name: `E2E-Test-Column-Updated-${Date.now()}`,
			color: "online-orange",
			visible: true,
			index: 1,
			description: "Updated description",
		};

		group("PUT /boards/{id}/columns{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const [, updateResponse] = columnClient.updateColumn(
					board.id,
					createdColumn!.id,
					updateColumnRequest,
					new http.CookieJar(),
				);

				check(updateResponse, {
					"verify unauthenticated update column status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user returns 403", () => {
				const [, updateResponse] = columnClient.updateColumn(
					board.id,
					createdColumn!.id,
					updateColumnRequest,
					authenticatedContext,
				);

				check(updateResponse, {
					"verify authenticated user update column status is 403": (r) => r.status === 403,
				});
			});

			group("with participant returns 403", () => {
				const [, participantUpdateColumnResponse] = columnClient.updateColumn(
					board.id,
					createdColumn!.id,
					updateColumnRequest,
					participantContext,
				);

				check(participantUpdateColumnResponse, {
					"verify participant update column status is 403": (r) => r.status === 403,
				});
			});

			group("with owner returns 200 and updated column", () => {
				const [updatedColumn, ownerUpdateColumnResponse] = columnClient.updateColumn(
					board.id,
					createdColumn!.id,
					updateColumnRequest,
					ownerContext,
				);

				check(ownerUpdateColumnResponse, {
					"verify owner update column status is 200": (r) => r.status === 200,
					"verify updated column name matches": () => updatedColumn?.name === updateColumnRequest.name,
					"verify updated column color matches": () => updatedColumn?.color === updateColumnRequest.color,
				});
			});
		});

		group("DELETE /boards/{id}/columns{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const deleteResponse = columnClient.deleteColumn(board.id, createdColumn!.id, new http.CookieJar());

				check(deleteResponse, {
					"verify unauthenticated delete column status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user returns 403", () => {
				const deleteResponse = columnClient.deleteColumn(board.id, createdColumn!.id, authenticatedContext);

				check(deleteResponse, {
					"verify authenticated user delete column status is 403": (r) => r.status === 403,
				});
			});

			group("with participant return 403", () => {
				const deleteResponse = columnClient.deleteColumn(board.id, createdColumn!.id, participantContext);

				check(deleteResponse, {
					"verify regular participant delete column status is 403": (r) => r.status === 403,
				});
			});

			group("with owner returns 204", () => {
				const deleteResponse = columnClient.deleteColumn(board.id, createdColumn!.id, ownerContext);

				check(deleteResponse, {
					"verify owner delete column status is 204": (r) => r.status === 204,
				});
			});
		});
	});

	group("Note endpoints", () => {
		const ownerContext = new http.CookieJar();
		const ownerRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Note-Owner-${Date.now()}`,
		};
		const [owner] = authClient.loginAnonymous(ownerRequest, ownerContext);
		if (!owner) {
			check(owner, { "failed to create owner": () => false });
			return;
		}

		const authenticatedContext = new http.CookieJar();
		const authenticatedRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Note-Authenticated-${Date.now()}`,
		};
		const [user] = authClient.loginAnonymous(authenticatedRequest, authenticatedContext);
		if (!user) {
			check(user, { "failed to create user": () => false });
			return;
		}

		const participantContext = new http.CookieJar();
		const participantRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Note-Participant-${Date.now()}`,
		};
		const [participant] = authClient.loginAnonymous(participantRequest, participantContext);
		if (!participant) {
			check(participant, { "failed to create participant": () => false });
			return;
		}

		const createBoardRequest: CreateBoardRequest = {
			name: `E2E-Note-Test-${Date.now()}`,
			accessPolicy: "PUBLIC",
			columns: [
				{
					name: `E2E-Test-Note-1-${Date.now()}`,
					index: 0,
					color: "backlog-blue",
					visible: true,
				},
				{
					name: `E2E-Test-Note-2-${Date.now()}`,
					index: 1,
					color: "online-orange",
					visible: true,
				},
				{
					name: `E2E-Test-Note-3-${Date.now()}`,
					index: 2,
					color: "goal-green",
					visible: true,
				},
			],
		};
		const [board] = boardClient.createBoard(createBoardRequest, ownerContext);
		if (!board) {
			check(board, { "failed to create board": () => false });
			return;
		}

		const joinResponse = boardClient.joinBoard(board.id, {}, participantContext);
		check(joinResponse, {
			"verify board join status is 201": (r) => r.status === 201,
		});

		const [columns] = columnClient.getColumns(board.id, ownerContext);
		if (!columns || columns.length < 3) {
			check(columns, { "failed to create columns": () => false });
			return;
		}

		const column1Id = columns[0].id;
		const column2Id = columns[1].id;
		const column3Id = columns[2].id;

		const noteRequest: CreateNoteRequest = {
			column: column1Id,
			text: "Test note",
		};

		let ownerNote: Note | null = null;
		let participantNote: Note | null = null;

		group("POST /boards/{id}/notes ", () => {
			group("with unauthenticated user returns 401", () => {
				const [, noteResponse] = noteClient.createNote(board.id, noteRequest, new http.CookieJar());

				check(noteResponse, {
					"verify unauthenticated create note status is 401": (r) => r.status === 401,
				});
			});

			group("POST /boards/{id}/notes with authenticated user returns 403", () => {
				const [, noteResponse] = noteClient.createNote(board.id, noteRequest, authenticatedContext);

				check(noteResponse, {
					"verify authenticated user create note status is 403": (r) => r.status === 403,
				});
			});

			group("POST /boards/{id}/notes with owner returns 201 and created note", () => {
				const ownerNoteRequest: CreateNoteRequest = {
					column: column1Id,
					text: `Test note by owner ${Date.now()}`,
				};

				const [note, noteresponse] = noteClient.createNote(board.id, ownerNoteRequest, ownerContext);

				check(noteresponse, {
					"verify owner create note status is 201": (r) => r.status === 201,
					"verify created note text matches": () => note?.text === ownerNoteRequest.text,
					"verify created note column matches": () => note?.position.column === column1Id,
					"verify created note author is owner": () => note?.author === owner.id,
				});

				ownerNote = note;
			});

			group("POST /boards/{id}/notes with participant returns 201 and created note", () => {
				const participantNoteRequest: CreateNoteRequest = {
					column: column2Id,
					text: `Test note by participant ${Date.now()}`,
				};

				const [note, noteResponse] = noteClient.createNote(board.id, participantNoteRequest, participantContext);

				check(noteResponse, {
					"verify participant create note status is 201": (r) => r.status === 201,
					"verify participant created note text matches": () => note?.text === participantNoteRequest.text,
					"verify participant created note column matches": () => note?.position.column === column2Id,
					"verify participant created note author is participant": () => note?.author === participant.id,
				});

				participantNote = note;
			});
		});

		if (!ownerNote) {
			check(ownerNote, { "failed to create owner note": () => false });
			return;
		}

		if (!participantNote) {
			check(participantNote, { "failed to create participant note": () => false });
			return;
		}

		group("GET /boards/{id}/notes", () => {
			group("with unauthenticated user returns 401", () => {
				const [, noteresponse] = noteClient.getNotes(board.id, new http.CookieJar());

				check(noteresponse, {
					"verify unauthenticated get notes status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user returns 403", () => {
				const [, noteResponse] = noteClient.getNotes(board.id, authenticatedContext);

				check(noteResponse, {
					"verify authenticated user get notes status is 403": (r) => r.status === 403,
				});
			});

			group("with participant returns 200 and notes", () => {
				const [notes, noteResponse] = noteClient.getNotes(board.id, participantContext);

				check(noteResponse, {
					"verify participant get notes status is 200": (r) => r.status === 200,
					"verify participant notes count is 2": () => notes?.length === 2,
				});
			});

			group("with owner returns 200 and notes", () => {
				const [notes, noteResponse] = noteClient.getNotes(board.id, ownerContext);

				check(noteResponse, {
					"verify owner get notes status is 200": (r) => r.status === 200,
					"verify owner notes count is 2": () => notes?.length === 2,
				});
			});
		});

		group("GET /boards/{id}/notes/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const [, noteResponse] = noteClient.getNote(board.id, participantNote!.id, new http.CookieJar());

				check(noteResponse, {
					"verify unauthenticated get note status is 401": (r) => r.status === 401,
				});
			});

			group("GET /boards/{id}/notes/{id} with authenticated user returns 403", () => {
				const [, noteResponse] = noteClient.getNote(board.id, participantNote!.id, authenticatedContext);

				check(noteResponse, {
					"verify authenticated user get note status is 403": (r) => r.status === 403,
				});
			});

			group("GET /boards/{id}/notes/{id} with participant returns 200 and owner note", () => {
				const [note, noteResponse] = noteClient.getNote(board.id, ownerNote!.id, participantContext);

				check(noteResponse, {
					"verify participant get owner note status is 200": (r) => r.status === 200,
					"verify get owner note id matches": () => note?.id === ownerNote!.id,
					"verify get owner note text matches": () => note?.text === ownerNote!.text,
				});
			});

			group("GET /boards/{id}/notes/{id} with owner returns 200 and participant note", () => {
				const [note, noteResponse] = noteClient.getNote(board.id, participantNote!.id, ownerContext);

				check(noteResponse, {
					"verify owner get participant note status is 200": (r) => r.status === 200,
					"verify get participant note id matches": () => note?.id === participantNote!.id,
					"verify get participant note text matches": () => note?.text === participantNote!.text,
				});
			});
		});

		group("PUT /boards/{id}/notes/{id}", () => {
			const updateNoteRequest: UpdateNoteRequest = {
				text: "Test note updated",
				position: { column: column3Id, rank: 1 },
			};

			group("with unauthenticated user returns 401", () => {
				const [, noteResponse] = noteClient.updateNote(
					board.id,
					participantNote!.id,
					updateNoteRequest,
					new http.CookieJar(),
				);

				check(noteResponse, {
					"verify unauthenticated update note status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user returns 403", () => {
				const [, noteResponse] = noteClient.updateNote(
					board.id,
					participantNote!.id,
					updateNoteRequest,
					authenticatedContext,
				);

				check(noteResponse, {
					"verify authenticated user update note status is 403": (r) => r.status === 403,
				});
			});

			group("with participant returns 200 and updated note", () => {
				const updateRequest: UpdateNoteRequest = {
					text: `Test note updated by participant ${Date.now()}`,
					position: { column: column3Id, rank: 1 },
				};

				const [note, noteResponse] = noteClient.updateNote(
					board.id,
					participantNote!.id,
					updateRequest,
					participantContext,
				);

				check(noteResponse, {
					"verify participant update note status is 200": (r) => r.status === 200,
					"verify participant updated note text matches": () => note?.text === updateRequest.text,
					"verify participant updated note column matches": () => note?.position.column === column3Id,
				});
			});

			group("with owner returns 200 and updated note", () => {
				const updateRequest: UpdateNoteRequest = {
					text: `Test note updated by owner ${Date.now()}`,
					position: { column: column3Id, rank: 2 },
				};

				const [note, noteResponse] = noteClient.updateNote(board.id, ownerNote!.id, updateRequest, ownerContext);

				check(noteResponse, {
					"verify owner update note status is 200": (r) => r.status === 200,
					"verify owner updated note text matches": () => note?.text === updateRequest.text,
					"verify owner updated note column matches": () => note?.position.column === column3Id,
				});
			});
		});

		group("DELETE /boards/{id}/notes/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const deleteRequest: DeleteNoteRequest = { deleteStack: false };

				const noteResponse = noteClient.deleteNote(board.id, participantNote!.id, deleteRequest, new http.CookieJar());

				check(noteResponse, {
					"verify unauthenticated delete note status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user returns 403", () => {
				const deleteRequest: DeleteNoteRequest = { deleteStack: false };

				const noteResponse = noteClient.deleteNote(board.id, participantNote!.id, deleteRequest, authenticatedContext);

				check(noteResponse, {
					"verify non-participant delete note status is 403": (r) => r.status === 403,
				});
			});

			group("with owner returns 204 for participant note", () => {
				const deleteRequest: DeleteNoteRequest = { deleteStack: false };

				const noteResponse = noteClient.deleteNote(board.id, participantNote!.id, deleteRequest, ownerContext);

				check(noteResponse, {
					"verify participant note deletion status is 204": (r) => r.status === 204,
				});
			});

			group("with owner returns 204", () => {
				const deleteRequest: DeleteNoteRequest = { deleteStack: false };

				const noteResponse = noteClient.deleteNote(board.id, ownerNote!.id, deleteRequest, ownerContext);

				check(noteResponse, {
					"verify owner note deletion status is 204": (r) => r.status === 204,
				});
			});
		});
	});

	group("Voting and vote endpoints", () => {
		const ownerContext = new http.CookieJar();
		const ownerRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Voting-Owner-${Date.now()}`,
		};

		const [owner] = authClient.loginAnonymous(ownerRequest, ownerContext);
		if (!owner) {
			check(owner, { "failed to create owner": () => false });
			return;
		}

		const authenticatedContext = new http.CookieJar();
		const authenticatedRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Voting-Authenticated-${Date.now()}`,
		};

		const [user] = authClient.loginAnonymous(authenticatedRequest, authenticatedContext);
		if (!user) {
			check(user, { "failed to create user": () => false });
			return;
		}

		const participantContext = new http.CookieJar();
		const participantRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Voting-Participant-${Date.now()}`,
		};

		const [participant] = authClient.loginAnonymous(participantRequest, participantContext);
		if (!participant) {
			check(participant, { "failed to create participant": () => false });
			return;
		}

		const createBoardRequest: CreateBoardRequest = {
			name: `E2E-Voting-Test-${Date.now()}`,
			accessPolicy: "PUBLIC",
			columns: [
				{
					name: `E2E-Test-Voting-1-${Date.now()}`,
					index: 0,
					color: "backlog-blue",
					visible: true,
				},
				{
					name: `E2E-Test-Voting-2-${Date.now()}`,
					index: 1,
					color: "online-orange",
					visible: true,
				},
				{
					name: `E2E-Test-Voting-3-${Date.now()}`,
					index: 2,
					color: "goal-green",
					visible: true,
				},
			],
		};

		const [board] = boardClient.createBoard(createBoardRequest, ownerContext);
		if (!board) {
			check(board, { "failed to create board": () => false });
			return;
		}

		const joinResponse = boardClient.joinBoard(board.id, {}, participantContext);
		check(joinResponse, {
			"verify joinBoard status is 201": (r) => r.status === 201,
		});

		const [columns] = columnClient.getColumns(board.id, ownerContext);
		if (!columns || columns.length < 3) {
			check(columns, { "failed to create columns": () => false });
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
			check(note1, { "failed to create notes": () => false });
			return;
		}

		let createdVoting: Voting | null = null;

		group("POST /boards/{id}/votings", () => {
			const votingRequest: CreateVotingRequest = {
				voteLimit: 5,
				allowMultipleVotes: true,
				showVotesOfOthers: true,
				isAnonymous: false,
			};

			group("with unauthenticated user returns 401", () => {
				const [, votingReponse] = votingClient.createVoting(board.id, votingRequest, new http.CookieJar());

				check(votingReponse, {
					"verify unauthenticated create voting status is 401": (r) => r.status === 401,
				});
			});

			group("POST /boards/{id}/votings with authenticated user returns 403", () => {
				const [, votingResponse] = votingClient.createVoting(board.id, votingRequest, authenticatedContext);

				check(votingResponse, {
					"verify authenticated user create voting status is 403": (r) => r.status === 403,
				});
			});

			group("POST /boards/{id}/votings with participant returns 403", () => {
				const [, votingResponse] = votingClient.createVoting(board.id, votingRequest, participantContext);

				check(votingResponse, {
					"verify participant create voting status is 403": (r) => r.status === 403,
				});
			});

			group("POST /boards/{id}/votings with owner returns 201 and created voting", () => {
				const [voting, votingResponse] = votingClient.createVoting(board.id, votingRequest, ownerContext);

				check(votingResponse, {
					"verify owner create voting status is 201": (r) => r.status === 201,
					"verify voting status is OPEN": () => voting?.status === "OPEN",
					"verify voting vote limit is 5": () => voting?.voteLimit === 5,
				});

				createdVoting = voting;
			});
		});

		if (!createdVoting) {
			check(createdVoting, { "failed to create voting": () => false });
			return;
		}

		group("GET /boards/{id}/votings", () => {
			group("with unauthenticated user returns 401", () => {
				const [, votingResponse] = votingClient.getVotings(board.id, new http.CookieJar());

				check(votingResponse, {
					"verify unauthenticated get votings status is 401": (r) => r.status === 401,
				});
			});

			group("GET /boards/{id}/votings with authenticated user returns 403", () => {
				const [, votingResponse] = votingClient.getVotings(board.id, authenticatedContext);

				check(votingResponse, {
					"verify authenticated user get votings status is 403": (r) => r.status === 403,
				});
			});

			group("GET /boards/{id}/votings with participant returns 200 and votings", () => {
				const [votings, votingResponse] = votingClient.getVotings(board.id, participantContext);

				check(votingResponse, {
					"verify participant get votings status is 200": (r) => r.status === 200,
					"verify participant votings count is 1": () => votings?.length === 1,
				});
			});

			group("GET /boards/{id}/votings with owner returns 200 and votings", () => {
				const [votings, votingResponse] = votingClient.getVotings(board.id, ownerContext);

				check(votingResponse, {
					"verify owner get votings status is 200": (r) => r.status === 200,
					"verify owner votings count is 1": () => votings?.length === 1,
				});
			});
		});

		group("GET /boards/{id}/votings/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const [, votingResponse] = votingClient.getVoting(board.id, createdVoting!.id, new http.CookieJar());

				check(votingResponse, {
					"verify unauthenticated get voting status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user returns 403", () => {
				const [, votingResponse] = votingClient.getVoting(board.id, createdVoting!.id, authenticatedContext);

				check(votingResponse, {
					"verify authenticated user get voting status is 403": (r) => r.status === 403,
				});
			});

			group("with participant returns 200 and voting", () => {
				const [voting, votingResponse] = votingClient.getVoting(board.id, createdVoting!.id, participantContext);

				check(votingResponse, {
					"verify participant get voting status is 200": (r) => r.status === 200,
					"verify participant voting id matches": () => voting?.id === createdVoting!.id,
					"verify participant voting status is OPEN": () => voting?.status === "OPEN",
				});
			});

			group("with owner returns 200 and voting", () => {
				const [voting, votingResponse] = votingClient.getVoting(board.id, createdVoting!.id, ownerContext);

				check(votingResponse, {
					"verify owner get voting status is 200": (r) => r.status === 200,
					"verify owner voting id matches": () => voting?.id === createdVoting!.id,
					"verify owner voting status is OPEN": () => voting?.status === "OPEN",
				});
			});
		});

		group("POST /boards/{id}/votes", () => {
			group("with unauthenticated user returns 401", () => {
				const [, voteResponse] = voteClient.createVote(board.id, { note: note1.id }, new http.CookieJar());

				check(voteResponse, {
					"verify unauthenticated create vote status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user returns 403", () => {
				const [, voteResponse] = voteClient.createVote(board.id, { note: note1.id }, authenticatedContext);

				check(voteResponse, {
					"verify authenticated user create vote status is 403": (r) => r.status === 403,
				});
			});
			group("with participant returns 201 and created vote", () => {
				const [vote, voteResponse] = voteClient.createVote(board.id, { note: note1.id }, participantContext);

				check(voteResponse, {
					"verify participant vote 1 status is 201": (r) => r.status === 201,
					"verify vote user": () => vote?.user === participant.id,
					"verify vote note": () => vote?.note === note1.id,
					"verify vote voting": () => vote?.voting === createdVoting!.id,
				});
			});

			group("with participant returns 201 and created second vote", () => {
				const [vote, voteResponse] = voteClient.createVote(board.id, { note: note3.id }, participantContext);

				check(voteResponse, {
					"verify participant vote 2 status is 201": (r) => r.status === 201,
					"verify vote user": () => vote?.user === participant.id,
					"verify vote note": () => vote?.note === note3.id,
					"verify vote voting": () => vote?.voting === createdVoting!.id,
				});
			});

			group("with participant returns 201 and created third vote", () => {
				const [vote, voteResponse] = voteClient.createVote(board.id, { note: note5.id }, participantContext);

				check(voteResponse, {
					"verify participant vote 3 status is 201": (r) => r.status === 201,
					"verify vote user": () => vote?.user === participant.id,
					"verify vote note": () => vote?.note === note5.id,
					"verify vote voting": () => vote?.voting === createdVoting!.id,
				});
			});

			group("with owner returns 201 and created vote", () => {
				const [vote, voteResponse] = voteClient.createVote(board.id, { note: note2.id }, ownerContext);

				check(voteResponse, {
					"verify owner vote 1 status is 201": (r) => r.status === 201,
					"verify vote user": () => vote?.user === owner.id,
					"verify vote note": () => vote?.note === note2.id,
					"verify vote voting": () => vote?.voting === createdVoting!.id,
				});
			});

			group("with owner returns 201 and created second vote", () => {
				const [vote, voteResponse] = voteClient.createVote(board.id, { note: note4.id }, ownerContext);

				check(voteResponse, {
					"verify owner vote 2 status is 201": (r) => r.status === 201,
					"verify vote user": () => vote?.user === owner.id,
					"verify vote note": () => vote?.note === note4.id,
					"verify vote voting": () => vote?.voting === createdVoting!.id,
				});
			});

			group("with owner returns 201 and created third vote", () => {
				const [vote, voteResponse] = voteClient.createVote(board.id, { note: note6.id }, ownerContext);

				check(voteResponse, {
					"verify owner vote 3 status is 201": (r) => r.status === 201,
					"verify vote user": () => vote?.user === owner.id,
					"verify vote note": () => vote?.note === note6.id,
					"verify vote voting": () => vote?.voting === createdVoting!.id,
				});
			});
		});

		group("GET /boards/{id}/votes", () => {
			group("with unauthenticated user returns 401", () => {
				const [, voteResponse] = voteClient.getVotes(board.id, createdVoting!.id, null, new http.CookieJar());

				check(voteResponse, {
					"verify unauthenticated get votes status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user returns 403", () => {
				const [, voteResponse] = voteClient.getVotes(board.id, createdVoting!.id, null, authenticatedContext);

				check(voteResponse, {
					"verify authenticated user get votes status is 403": (r) => r.status === 403,
				});
			});

			group("with participant returns 200 and votes", () => {
				const [votes, voteResponse] = voteClient.getVotes(board.id, createdVoting!.id, null, participantContext);

				check(voteResponse, {
					"verify participant get votes status is 200": (r) => r.status === 200,
					"verify participant votes count is 3": () => votes?.length === 3,
				});
			});

			group("with owner returns 200 and votes", () => {
				const [votes, voteResponse] = voteClient.getVotes(board.id, createdVoting!.id, null, ownerContext);

				check(voteResponse, {
					"verify owner get votes status is 200": (r) => r.status === 200,
					"verify owner votes count is 3": () => votes?.length === 3,
				});
			});

			group("for note with owner returns 200 and votes", () => {
				const [votes, voteResponse] = voteClient.getVotes(board.id, createdVoting!.id, note2.id, ownerContext);

				check(voteResponse, {
					"verify note votes status is 200": (r) => r.status === 200,
					"verify note votes count is 1": () => votes?.length === 1,
				});
			});
		});

		group("DELETE /boards/{id}/votes", () => {
			group("with unauthenticated user returns 401", () => {
				const voteResponse = voteClient.deleteVote(board.id, { note: note2.id }, new http.CookieJar());

				check(voteResponse, {
					"verify unauthenticated delete vote status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user returns 403", () => {
				const voteResponse = voteClient.deleteVote(board.id, { note: note2.id }, authenticatedContext);

				check(voteResponse, {
					"verify authenticated user delete vote status is 403": (r) => r.status === 403,
				});
			});

			group("with participant returns 204", () => {
				const voteResponse = voteClient.deleteVote(board.id, { note: note3.id }, participantContext);

				check(voteResponse, {
					"verify participant delete vote status is 204": (r) => r.status === 204,
				});
			});

			group("with owner returns 204", () => {
				const voteResponse = voteClient.deleteVote(board.id, { note: note2.id }, ownerContext);

				check(voteResponse, {
					"verify owner delete vote status is 204": (r) => r.status === 204,
				});
			});
		});

		group("PUT /boards/{id}/votings/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const [, votingResponse] = votingClient.updateVoting(
					board.id,
					createdVoting!.id,
					{ status: "CLOSED" },
					new http.CookieJar(),
				);

				check(votingResponse, {
					"verify unauthenticated close voting status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user returns 403", () => {
				const [, votingResponse] = votingClient.updateVoting(
					board.id,
					createdVoting!.id,
					{ status: "CLOSED" },
					authenticatedContext,
				);

				check(votingResponse, {
					"verify authenticated user close voting status is 403": (r) => r.status === 403,
				});
			});

			group("with participant returns 403", () => {
				const [, votingResponse] = votingClient.updateVoting(
					board.id,
					createdVoting!.id,
					{ status: "CLOSED" },
					participantContext,
				);

				check(votingResponse, {
					"verify participant close voting status is 403": (r) => r.status === 403,
				});
			});

			group("with owner returns 200 and closed voting", () => {
				const [voting, votingResponse] = votingClient.updateVoting(
					board.id,
					createdVoting!.id,
					{ status: "CLOSED" },
					ownerContext,
				);

				check(votingResponse, {
					"verify owner close voting status is 200": (r) => r.status === 200,
					"verify closed voting status is CLOSED": () => voting?.status === "CLOSED",
				});
			});
		});
	});

	group("Session and session request endpoints", () => {
		const ownerContext = new http.CookieJar();
		const ownerRequest: AnonymousSignUpRequest = {
			name: `SessionOwner-${Date.now()}`,
		};
		const [,] = authClient.loginAnonymous(ownerRequest, ownerContext);

		const candidateContext = new http.CookieJar();
		const candidateRequest: AnonymousSignUpRequest = {
			name: `SessionCandidate-${Date.now()}`,
		};
		const [candidate] = authClient.loginAnonymous(candidateRequest, candidateContext);
		if (!candidate) {
			check(candidate, { "failed to create candidate": () => false });
			return;
		}

		const createBoardRequest: CreateBoardRequest = {
			name: `E2E-Session-Test-${Date.now()}`,
			accessPolicy: "BY_INVITE",
			columns: [],
		};
		const [board] = boardClient.createBoard(createBoardRequest, ownerContext);
		if (!board) {
			check(board, { "failed to create board": () => false });
			return;
		}

		group("POST /boards/{id}/participants ", () => {
			group("with unauthenticated user returns 401", () => {
				const joinResponse = boardClient.joinBoard(board.id, {}, new http.CookieJar());

				check(joinResponse, {
					"verify unauthenticated join board with invite status is 401": (r) => r.status === 401,
				});
			});

			group("with candidate returns 200, 201 or 303", () => {
				const joinResponse = boardClient.joinBoard(board.id, {}, candidateContext);

				check(joinResponse, {
					"verify candidate join board status is 200 or 201 or 303": (r) =>
						r.status === 200 || r.status === 201 || r.status === 303,
				});
			});
		});

		group("GET /boards/{id}/requests", () => {
			group("with unauthenticated user returns 401", () => {
				const [, requestResponse] = sessionRequestClient.getBoardSessionRequests(board.id, null, new http.CookieJar());

				check(requestResponse, {
					"verify unauthenticated get board session requests status is 401": (r) => r.status === 401,
				});
			});

			group("with candidate returns 403", () => {
				const [, requestResponse] = sessionRequestClient.getBoardSessionRequests(board.id, null, candidateContext);

				check(requestResponse, {
					"verify candidate get board session requests status is 403": (r) => r.status === 403,
				});
			});

			group("with owner returns 200 and requests", () => {
				const [requests, requestResponse] = sessionRequestClient.getBoardSessionRequests(board.id, null, ownerContext);

				check(requestResponse, {
					"verify owner get board session requests status is 200": (r) => r.status === 200,
					"verify owner session requests count is 1": () => requests?.length === 1,
				});
			});
		});

		group("GET /boards/{id}/requests/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const [, requestResponse] = sessionRequestClient.getBoardSessionRequest(
					board.id,
					candidate.id,
					new http.CookieJar(),
				);

				check(requestResponse, {
					"verify unauthenticated get board session request status is 401": (r) => r.status === 401,
				});
			});

			group("with candidate returns 200 and request", () => {
				const [requests, requestResponse] = sessionRequestClient.getBoardSessionRequest(
					board.id,
					candidate.id,
					candidateContext,
				);

				check(requestResponse, {
					"verify candidate get board session request status is 200": (r) => r.status === 200,
					"verify candidate request status is PENDING": () => requests?.status === "PENDING",
				});
			});
		});

		group("PUT /boards/{id}/requests/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const [, requestResponse] = sessionRequestClient.updateBoardSessionRequest(
					board.id,
					candidate.id,
					{ status: "ACCEPTED" },
					new http.CookieJar(),
				);

				check(requestResponse, {
					"verify unauthenticated update board session request status is 401": (r) => r.status === 401,
				});
			});

			group("with candidate returns 403", () => {
				const [, requestResponse] = sessionRequestClient.updateBoardSessionRequest(
					board.id,
					candidate.id,
					{ status: "ACCEPTED" },
					candidateContext,
				);

				check(requestResponse, {
					"verify candidate update board session request status is 403": (r) => r.status === 403,
				});
			});

			group("with owner returns 200 and accepted request", () => {
				const [request, requestResponse] = sessionRequestClient.updateBoardSessionRequest(
					board.id,
					candidate.id,
					{ status: "ACCEPTED" },
					ownerContext,
				);

				check(requestResponse, {
					"verify owner update board session request status is 200": (r) => r.status === 200,
					"verify accepted request status is ACCEPTED": () => request?.status === "ACCEPTED",
				});
			});
		});

		group("GET /boards/{id}/participants", () => {
			group("with unauthenticated user returns 401", () => {
				const [, requestResponse] = sessionClient.getParticipants(
					board.id,
					null,
					null,
					null,
					null,
					new http.CookieJar(),
				);

				check(requestResponse, {
					"verify unauthenticated get participants status is 401": (r) => r.status === 401,
				});
			});

			group("with candidate returns 200 and participants", () => {
				const [session, sessionResponse] = sessionClient.getParticipants(
					board.id,
					null,
					null,
					null,
					null,
					candidateContext,
				);

				check(sessionResponse, {
					"verify candidate get participants status is 200": (r) => r.status === 200,
					"verify candidate sessions count is 2": () => session?.length === 2,
				});
			});

			group("with owner returns 200 and participants", () => {
				const [session, sessionResponse] = sessionClient.getParticipants(
					board.id,
					null,
					null,
					null,
					null,
					ownerContext,
				);

				check(sessionResponse, {
					"verify owner get participants status is 200": (r) => r.status === 200,
					"verify owner sessions count is 2": () => session?.length === 2,
				});
			});
		});

		group("GET /boards/{id}/participants/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const [, sessionResponse] = sessionClient.getParticipant(board.id, candidate.id, new http.CookieJar());

				check(sessionResponse, {
					"verify unauthenticated get participant status is 401": (r) => r.status === 401,
				});
			});

			group("with candidate returns 200 and participant", () => {
				const [session, sessionResponse] = sessionClient.getParticipant(board.id, candidate.id, candidateContext);

				check(sessionResponse, {
					"verify candidate get participant status is 200": (r) => r.status === 200,
					"verify candidate session id matches": () => session?.id === candidate.id,
					"verify candidate session role is PARTICIPANT": () => session?.role === "PARTICIPANT",
				});
			});
		});

		group("PUT /boards/{id}/participants/{id}", () => {
			const updateSessionReqest: BoardSessionUpdateRequest = {
				ready: true,
				raisedHand: true,
			};

			group("with unauthenticated user returns 401", () => {
				const [, sessionResponse] = sessionClient.updateParticipant(
					board.id,
					candidate.id,
					updateSessionReqest,
					new http.CookieJar(),
				);

				check(sessionResponse, {
					"verify unauthenticated update participant status is 401": (r) => r.status === 401,
				});
			});

			group("with candidate returns 200 and updated participant", () => {
				const [session, sessionResponse] = sessionClient.updateParticipant(
					board.id,
					candidate.id,
					updateSessionReqest,
					candidateContext,
				);

				check(sessionResponse, {
					"verify participant update participant status is 200": (r) => r.status === 200,
					"verify updated session is ready": () => session?.ready === true,
					"verify updated session raised hand": () => session?.raisedHand === true,
				});
			});

			group("with owner returns 200 and promoted participant", () => {
				const [session, sessionResponse] = sessionClient.updateParticipant(
					board.id,
					candidate.id,
					{ role: "MODERATOR" },
					ownerContext,
				);

				check(sessionResponse, {
					"verify owner promote participant status is 200": (r) => r.status === 200,
					"verify promoted session role is MODERATOR": () => session?.role === "MODERATOR",
				});
			});
		});

		const bulkUpdateRequest: BoardSessionsUpdateRequest = {
			ready: false,
			raisedHand: false,
		};

		group("PUT /boards/{id}/participants", () => {
			group("with unauthenticated user returns 401", () => {
				const [, sessionResponse] = sessionClient.updateParticipants(board.id, bulkUpdateRequest, new http.CookieJar());

				check(sessionResponse, {
					"verify unauthenticated update participants status is 401": (r) => r.status === 401,
				});
			});

			group("with owner returns 200 and updated participants", () => {
				const [sessions, sessionResponse] = sessionClient.updateParticipants(board.id, bulkUpdateRequest, ownerContext);

				check(sessionResponse, {
					"verify owner update participants status is 200": (r) => r.status === 200,
					"verify sessions count is 2": () => sessions?.length === 2,
				});
			});
		});

		group("DELETE /boards/{id}/participants/{id} ", () => {
			group("with unauthenticated user returns 401", () => {
				const sessionResponse = sessionClient.deleteParticipant(board.id, candidate.id, new http.CookieJar());

				check(sessionResponse, {
					"verify unauthenticated delete participant status is 401": (r) => r.status === 401,
				});
			});

			group("with candidate returns 204", () => {
				const sessionResponse = sessionClient.deleteParticipant(board.id, candidate.id, candidateContext);

				check(sessionResponse, {
					"verify candidate delete participant status is 204": (r) => r.status === 204,
				});
			});
		});
	});

	group("Reaction endpoints", () => {
		const ownerContext = new http.CookieJar();
		const ownerRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Reaction-Owner-${Date.now()}`,
		};
		const [owner] = authClient.loginAnonymous(ownerRequest, ownerContext);
		if (!owner) {
			check(owner, { "failed to create owner": () => false });
			return;
		}

		const createBoardRequest: CreateBoardRequest = {
			name: `E2E-Reaction-Test-${Date.now()}`,
			accessPolicy: "PUBLIC",
			columns: [{ name: "Column 1", color: "goal-green", visible: true, index: 0 }],
		};
		const [board] = boardClient.createBoard(createBoardRequest, ownerContext);
		if (!board) {
			check(board, { "failed to create board": () => false });
			return;
		}

		const [cols] = columnClient.getColumns(board.id, ownerContext);
		if (cols?.length !== 1) {
			check(cols, { "failed to create columns": () => false });
			return;
		}
		const colId = cols[0].id;

		const [note] = noteClient.createNote(board.id, { column: colId, text: "React Note" }, ownerContext);
		if (!note) {
			check(note, { "failed to create note": () => false });
			return;
		}

		let createdReaction: Reaction | null = null;

		group("POST /boards/{id}/reactions", () => {
			const reactionRequest: CreateReactionRequest = {
				note: note.id,
				reactionType: "heart",
			};

			group("with unauthenticated user returns 401", () => {
				const [, reactionResponse] = reactionClient.createReaction(board.id, reactionRequest, new http.CookieJar());

				check(reactionResponse, {
					"verify unauthenticated create reaction status is 401": (r) => r.status === 401,
				});
			});

			group("with owner returns 201 and created reaction", () => {
				const [reaction, reactionResponse] = reactionClient.createReaction(board.id, reactionRequest, ownerContext);

				check(reactionResponse, {
					"verify create reaction status is 201": (r) => r.status === 201,
					"verify created reaction type is heart": () => reaction?.reactionType === "heart",
					"verify created reaction note matches": () => reaction?.note === note.id,
					"verify created reaction user matches": () => reaction?.user === owner.id,
				});

				createdReaction = reaction;
			});
		});

		if (!createdReaction) {
			check(createdReaction, { "failed to create reaction": () => false });
			return;
		}

		group("GET /boards/{id}/reactions", () => {
			group("with unauthenticated user returns 401", () => {
				const [, reactionResponse] = reactionClient.getReactions(board.id, new http.CookieJar());

				check(reactionResponse, {
					"verify unauthenticated get reactions status is 401": (r) => r.status === 401,
				});
			});

			group("with owner returns 200 and reactions", () => {
				const [reactions, reactionResponse] = reactionClient.getReactions(board.id, ownerContext);

				check(reactionResponse, {
					"verify get reactions status is 200": (r) => r.status === 200,
					"verify reactions count is 1": () => reactions?.length === 1,
				});
			});
		});

		group("GET /boards/{id}/reactions/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const [, reactionResponse] = reactionClient.getReaction(board.id, createdReaction!.id, new http.CookieJar());

				check(reactionResponse, {
					"verify unauthenticated get reaction status is 401": (r) => r.status === 401,
				});
			});

			group("with owner returns 200 and reaction", () => {
				const [reaction, reactionResponse] = reactionClient.getReaction(board.id, createdReaction!.id, ownerContext);

				check(reactionResponse, {
					"verify get reaction status is 200": (r) => r.status === 200,
					"verify reaction id matches": () => reaction?.id === createdReaction!.id,
					"verify reaction type is heart": () => reaction?.reactionType === "heart",
				});
			});
		});

		group("PUT /boards/{id}/reactions/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const [, reactionResponse] = reactionClient.updateReaction(
					board.id,
					createdReaction!.id,
					{ reactionType: "joy" },
					new http.CookieJar(),
				);

				check(reactionResponse, {
					"verify unauthenticated update reaction status is 401": (r) => r.status === 401,
				});
			});

			group("with owner returns 200 and updated reaction", () => {
				const [reaction, reactionResponse] = reactionClient.updateReaction(
					board.id,
					createdReaction!.id,
					{ reactionType: "joy" },
					ownerContext,
				);

				check(reactionResponse, {
					"verify update reaction status is 200": (r) => r.status === 200,
					"verify updated reaction type is joy": () => reaction?.reactionType === "joy",
				});
			});
		});

		group("DELETE /boards/{id}/reactions/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const reactionResponse = reactionClient.deleteReaction(board.id, createdReaction!.id, new http.CookieJar());

				check(reactionResponse, {
					"verify unauthenticated delete reaction status is 401": (r) => r.status === 401,
				});
			});

			group("with owner returns 204", () => {
				const reactionResponse = reactionClient.deleteReaction(board.id, createdReaction!.id, ownerContext);

				check(reactionResponse, {
					"verify delete reaction status is 204": (r) => r.status === 204,
				});
			});
		});
	});

	group("Board reaction endpoints", () => {
		const ownerContext = new http.CookieJar();
		const ownerRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Board-Reaction-Owner-${Date.now()}`,
		};
		const [owner] = authClient.loginAnonymous(ownerRequest, ownerContext);
		if (!owner) {
			check(owner, { "failed to create owner": () => false });
			return;
		}

		const authenticatedContext = new http.CookieJar();
		const authenticatedRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Voting-Authenticated-${Date.now()}`,
		};
		const [user] = authClient.loginAnonymous(authenticatedRequest, authenticatedContext);
		if (!user) {
			check(user, { "failed to create user": () => false });
			return;
		}

		const createBoardRequest: CreateBoardRequest = {
			name: `E2E-Board-Reaction-Test-${Date.now()}`,
			accessPolicy: "PUBLIC",
			columns: [],
		};

		const [board] = boardClient.createBoard(createBoardRequest, ownerContext);
		if (!board) {
			check(board, { "failed to create board": () => false });
			return;
		}

		group("POST /boards/{id}/board-reactions", () => {
			group("with unauthenticated user returns 401", () => {
				const boradReactionResponse = boardReactionClient.createBoardReaction(
					board.id,
					{ reactionType: "tada" },
					new http.CookieJar(),
				);

				check(boradReactionResponse, {
					"verify unauthenticated create board reaction status is 401": (r) => r.status === 401,
				});
			});

			group("with authenticated user returns 403", () => {
				const boardReactionResponse = boardReactionClient.createBoardReaction(
					board.id,
					{ reactionType: "tada" },
					authenticatedContext,
				);

				check(boardReactionResponse, {
					"verify authenticated create board reaction status is 403": (r) => r.status === 403,
				});
			});

			group("with owner returns 201", () => {
				const boardReactionResponse = boardReactionClient.createBoardReaction(
					board.id,
					{ reactionType: "tada" },
					ownerContext,
				);

				check(boardReactionResponse, {
					"verify owner create board reaction status is 201": (r) => r.status === 201,
				});
			});
		});
	});

	group("Board and column template endpoints", () => {
		const userContext = new http.CookieJar();
		const userRequest: AnonymousSignUpRequest = {
			name: `Stan-E2E-Test-Template-Authenticated-${Date.now()}`,
		};
		const [user] = authClient.loginAnonymous(userRequest, userContext);
		if (!user) {
			check(user, { "failed to create user": () => false });
			return;
		}

		let createdTemplate: BoardTemplate | null = null;

		group("POST /templates", () => {
			const createTemplateRequest: CreateBoardTemplateRequest = {
				name: `E2E-Template-Test-${Date.now()}`,
				description: "Template description",
				favourite: false,
				columnTemplates: [
					{ name: "Good", color: "goal-green", visible: true, index: 0 },
					{ name: "Bad", color: "yielding-yellow", visible: true, index: 1 },
				],
			};

			group("with unauthenticated user returns 401", () => {
				const [, boardTemplateResponse] = boardTemplateClient.createBoardTemplate(
					createTemplateRequest,
					new http.CookieJar(),
				);

				check(boardTemplateResponse, {
					"verify unauthenticated create board template status is 401": (r) => r.status === 401,
				});
			});

			group("returns 201 and created board template", () => {
				const [boardTemplate, boardTemplateResponse] = boardTemplateClient.createBoardTemplate(
					createTemplateRequest,
					userContext,
				);

				check(boardTemplateResponse, {
					"verify create board template status is 201": (r) => r.status === 201,
					"verify created template name matches": () => boardTemplate?.name === createTemplateRequest.name,
					"verify created template creator is user": () => boardTemplate?.creator === user.id,
					"verify created template favourite is false": () => boardTemplate?.favourite === false,
				});

				createdTemplate = boardTemplate;
			});
		});

		if (!createdTemplate) {
			check(createdTemplate, { "failed to create board template": () => false });
			return;
		}

		group("GET /templates", () => {
			group("with unauthenticated user returns 401", () => {
				const [, boardTemplateResponse] = boardTemplateClient.getBoardTemplates(new http.CookieJar());

				check(boardTemplateResponse, {
					"verify unauthenticated get board templates status is 401": (r) => r.status === 401,
				});
			});

			group("returns 200 and board templates", () => {
				const [boardTemplates, boardTemplateResponse] = boardTemplateClient.getBoardTemplates(userContext);

				check(boardTemplateResponse, {
					"verify get board templates status is 200": (r) => r.status === 200,
					"verify count board templates is 1": () => boardTemplates?.length === 1,
					"verify get board templates contains created template": () =>
						boardTemplates?.[0].template.id === createdTemplate!.id,
				});
			});
		});

		group("GET /templates/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const [, boardTemplateResponse] = boardTemplateClient.getBoardTemplate(
					createdTemplate!.id,
					new http.CookieJar(),
				);

				check(boardTemplateResponse, {
					"verify unauthenticated get board template status is 401": (r) => r.status === 401,
				});
			});

			group("returns 200 and board template", () => {
				const [boardTemplate, boardTemplateResponse] = boardTemplateClient.getBoardTemplate(
					createdTemplate!.id,
					userContext,
				);

				check(boardTemplateResponse, {
					"verify get board template status is 200": (r) => r.status === 200,
					"verify template id matches": () => boardTemplate?.id === createdTemplate!.id,
					"verify template name matches": () => boardTemplate?.name === createdTemplate!.name,
				});
			});
		});

		group("PUT /templates/{id}", () => {
			const updateTemplateRequest: UpdateBoardTemplateRequest = {
				name: `E2E-Template-Test-Updated-${Date.now()}`,
				description: "Updated template description",
				favourite: true,
			};

			group("with unauthenticated user returns 401", () => {
				const [, boardTemplateResponse] = boardTemplateClient.updateBoardTemplate(
					createdTemplate!.id,
					updateTemplateRequest,
					new http.CookieJar(),
				);

				check(boardTemplateResponse, {
					"verify unauthenticated update board template status is 401": (r) => r.status === 401,
				});
			});

			group("returns 200 and updated board template", () => {
				const [boardTemplate, boardTemplateResponse] = boardTemplateClient.updateBoardTemplate(
					createdTemplate!.id,
					updateTemplateRequest,
					userContext,
				);

				check(boardTemplateResponse, {
					"verify update board template status is 200": (r) => r.status === 200,
					"verify updated template name matches": () => boardTemplate?.name === updateTemplateRequest.name,
					"verify updated template is favourite": () => boardTemplate?.favourite === true,
				});
			});
		});

		let createdColumnTemplate: ColumnTemplate | null = null;

		group("POST /templates/{id}/columns", () => {
			const columnTemplateRequest: ColumnTemplateRequest = {
				name: "Action Items",
				color: "value-violet",
				visible: true,
				index: 2,
				description: "Action items column",
			};

			group("with unauthenticated user returns 401", () => {
				const [, columnTemplateResponse] = columnTemplateClient.createColumnTemplate(
					createdTemplate!.id,
					columnTemplateRequest,
					new http.CookieJar(),
				);

				check(columnTemplateResponse, {
					"verify unauthenticated create column template status is 401": (r) => r.status === 401,
				});
			});

			group("returns 201 and created column template", () => {
				const [columnTemplate, columnTemplateResponse] = columnTemplateClient.createColumnTemplate(
					createdTemplate!.id,
					columnTemplateRequest,
					userContext,
				);

				check(columnTemplateResponse, {
					"verify create column template status is 201": (r) => r.status === 201,
					"verify created column template name matches": () => columnTemplate?.name === columnTemplateRequest.name,
					"verify created column template color matches": () => columnTemplate?.color === columnTemplateRequest.color,
				});

				createdColumnTemplate = columnTemplate;
			});
		});

		if (!createdColumnTemplate) {
			check(createdColumnTemplate, { "failed to create column template": () => false });
			return;
		}

		group("GET /templates/{id}/columns", () => {
			group("with unauthenticated user returns 401", () => {
				const [, columnTemplateResponse] = columnTemplateClient.getColumnTemplates(
					createdTemplate!.id,
					new http.CookieJar(),
				);

				check(columnTemplateResponse, {
					"verify unauthenticated get column templates status is 401": (r) => r.status === 401,
				});
			});

			group("returns 200 and column templates", () => {
				const [columnTemplates, columnTemplateResponse] = columnTemplateClient.getColumnTemplates(
					createdTemplate!.id,
					userContext,
				);

				check(columnTemplateResponse, {
					"verify get column templates status is 200": (r) => r.status === 200,
					"verify column templates count is 3": () => columnTemplates?.length === 3,
				});
			});
		});

		group("GET /templates/{id}/columns/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const [, columnTemplateResponse] = columnTemplateClient.getColumnTemplate(
					createdTemplate!.id,
					createdColumnTemplate!.id,
					new http.CookieJar(),
				);

				check(columnTemplateResponse, {
					"verify unauthenticated get column template status is 401": (r) => r.status === 401,
				});
			});

			group("returns 200 and column template", () => {
				const [columnTemplate, columnTemplateResponse] = columnTemplateClient.getColumnTemplate(
					createdTemplate!.id,
					createdColumnTemplate!.id,
					userContext,
				);

				check(columnTemplateResponse, {
					"verify get column template status is 200": (r) => r.status === 200,
					"verify column template id matches": () => columnTemplate?.id === createdColumnTemplate!.id,
					"verify column template name matches": () => columnTemplate?.name === "Action Items",
				});
			});
		});

		group("PUT /templates/{id}/columns/{id}", () => {
			const updateColumnTemplateRequest: ColumnTemplateRequest = {
				name: "Action Items (Updated)",
				color: "online-orange",
				visible: true,
				index: 2,
				description: "Updated description",
			};

			group("with unauthenticated user returns 401", () => {
				const [, columnTemplateResponse] = columnTemplateClient.updateColumnTemplate(
					createdTemplate!.id,
					createdColumnTemplate!.id,
					updateColumnTemplateRequest,
					new http.CookieJar(),
				);

				check(columnTemplateResponse, {
					"verify unauthenticated update column template status is 401": (r) => r.status === 401,
				});
			});

			group("returns 200 and updated column template", () => {
				const [columnTemplate, columnTemplateResponse] = columnTemplateClient.updateColumnTemplate(
					createdTemplate!.id,
					createdColumnTemplate!.id,
					updateColumnTemplateRequest,
					userContext,
				);

				check(columnTemplateResponse, {
					"verify update column template status is 200": (r) => r.status === 200,
					"verify updated column template name matches": () => columnTemplate?.name === "Action Items (Updated)",
					"verify updated column template color matches": () => columnTemplate?.color === "online-orange",
				});
			});
		});

		group("DELETE /templates/{id}/columns/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const columnTemplateResponse = columnTemplateClient.deleteColumnTemplate(
					createdTemplate!.id,
					createdColumnTemplate!.id,
					new http.CookieJar(),
				);

				check(columnTemplateResponse, {
					"verify unauthenticated delete column template status is 401": (r) => r.status === 401,
				});
			});

			group("returns 204", () => {
				const columnTemplateResponse = columnTemplateClient.deleteColumnTemplate(
					createdTemplate!.id,
					createdColumnTemplate!.id,
					userContext,
				);

				check(columnTemplateResponse, {
					"verify delete column template status is 204": (r) => r.status === 204,
				});
			});
		});

		group("DELETE /templates/{id}", () => {
			group("with unauthenticated user returns 401", () => {
				const columnTemplateResponse = boardTemplateClient.deleteBoardTemplate(
					createdTemplate!.id,
					new http.CookieJar(),
				);

				check(columnTemplateResponse, {
					"verify unauthenticated delete board template status is 401": (r) => r.status === 401,
				});
			});

			group("returns 204", () => {
				const columnTemplateResponse = boardTemplateClient.deleteBoardTemplate(createdTemplate!.id, userContext);

				check(columnTemplateResponse, {
					"verify delete board template status is 204": (r) => r.status === 204,
				});
			});
		});
	});
}
