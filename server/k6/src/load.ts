import { check } from "k6";
import exec from "k6/execution";
import http from "k6/http";
import { Rate, Trend } from "k6/metrics";
import { AuthClient } from "./api/auth/api.ts";
import { BoardClient } from "./api/board/api.ts";
import type { CreateBoardRequest } from "./api/board/requests.ts";
import { ColumnClient } from "./api/column/api.ts";
import { NoteClient } from "./api/note/api.ts";
import type { CreateNoteRequest } from "./api/note/requests.ts";
import { ReactionClient } from "./api/reaction/api.ts";
import type { CreateReactionRequest } from "./api/reaction/requests.ts";
import { SessionClient } from "./api/session/api.ts";
import { VoteClient } from "./api/vote/api.ts";
import type { CreateVoteRequest } from "./api/vote/requests.ts";
import { VotingClient } from "./api/voting/api.ts";
import type { CreateVotingRequest } from "./api/voting/requests.ts";
import { BASE_URL, options } from "./options.ts";
import type { ReactionType } from "./types/reaction.ts";


export { options };

interface SharedBoardData {
	boardId: string;
	columnIds: string[];
	adminToken: string;
}

export function setup(): SharedBoardData {
	const authClient = new AuthClient();
	const boardClient = new BoardClient();
	const columnClient = new ColumnClient();

	const adminContext = new http.CookieJar();

	const [, authResponse] = authClient.loginAnonymous({ name: "Admin" }, adminContext);

	const boardRequest: CreateBoardRequest = {
		name: `Collaborative-Board-${Date.now()}`,
		description: "This is a test board for laod tests",
		accessPolicy: "PUBLIC",
		columns: [
			{ name: "The Good", index: 0, visible: true, color: "backlog-blue" },
			{ name: "The Bad", index: 1, visible: true, color: "goal-green" },
			{ name: "And the Ugly", index: 2, visible: true, color: "online-orange" },
			{ name: "And the last One", index: 3, visible: true, color: "planning-pink" },
		],
	};

	const [board] = boardClient.createBoard(boardRequest, adminContext);
	if (!board) {
		throw new Error("Failed to create shared board");
	}

	const [columns] = columnClient.getColumns(board.id, adminContext);
	if (columns.length === 0) {
		throw new Error("failed to get created columns");
	}

	const columnIds = columns.map((c) => c.id);
	const adminJWT = authResponse.cookies.jwt?.[0]?.value || "";

	return { boardId: board.id, columnIds: columnIds, adminToken: adminJWT };
}

const isolatedLoginTrend = new Trend("isolated_login_duration", true);
const isolatedBoardCreationTrend = new Trend("isolated_board_creation_duration", true);
const isolatedColumnRetrieveTrend = new Trend("isolated_retrieve_column_duration", true);
const isolatedNoteCreationTrend = new Trend("isolated_note_creation_duration", true);
const isolatedNoteRetrieveTrend = new Trend("isolated_retrieve_note_duration", true);
const isolatedReactionCreation = new Trend("isolated_reaction_creation_duration", true);
const isolatedVotingCreation = new Trend("isolated_voting_creation_duration", true);
const isolatedVotingClosing = new Trend("isolated_voting_closing_duration", true);
const isolatedVoteCreation = new Trend("isolated_vote_creation_duration", true);
const isolatedSuccessRate = new Rate("isolated_success_rate", false);

export function isolated() {
	const authClient = new AuthClient();
	const boardClient = new BoardClient();
	const columnClient = new ColumnClient();
	const noteClient = new NoteClient();
	const reactionClient = new ReactionClient();
	const votingClient = new VotingClient();
	const voteClient = new VoteClient();

	const context = new http.CookieJar();

	const startlogin = Date.now();
	const [user, authResponse] = authClient.loginAnonymous(
		{ name: `Isolated-User-${exec.vu.idInTest}-${exec.vu.iterationInScenario}` },
		context,
	);
	isolatedLoginTrend.add(Date.now() - startlogin);
	check(authResponse, { "verify login response": (r) => r.status === 201 });
	if (!user) {
		isolatedSuccessRate.add(0);
		return;
	}

	const boardRequest: CreateBoardRequest = {
		name: `Test-Board-${exec.vu.idInTest}-${exec.vu.iterationInScenario}`,
		description: "Test board",
		accessPolicy: "PUBLIC",
		columns: [
			{ name: "The good", index: 0, visible: true, color: "yielding-yellow" },
			{ name: "The bad", index: 1, visible: true, color: "planning-pink" },
			{ name: "And the ugly", index: 2, visible: false, color: "goal-green" },
		],
	};
	const startBoardCreation = Date.now();
	const [board, boardResponse] = boardClient.createBoard(boardRequest, context);
	isolatedBoardCreationTrend.add(Date.now() - startBoardCreation);
	check(boardResponse, { "verify board created response": (r) => r.status === 201 });
	if (!board) {
		isolatedSuccessRate.add(0);
		return;
	}

	const startColumnRetrieve = Date.now();
	const [columns, columnResponse] = columnClient.getColumns(board.id, context);
	isolatedColumnRetrieveTrend.add(Date.now() - startColumnRetrieve);
	check(columnResponse, { "verify columns are retrieved": (r) => r.status === 200 });
	if (!columns || columns.length === 0) {
		isolatedSuccessRate.add(0);
		return;
	}

	for (const column of columns) {
		for (let i = 0; i < 5; i++) {
			const noteRequest: CreateNoteRequest = {
				column: column.id,
				text: `Note ${i} text for ${exec.vu.idInTest} in iteration ${exec.vu.iterationInScenario} at ${Date.now()}`,
			};

			const startNoteCreation = Date.now();
			const [, noteResponse] = noteClient.createNote(board.id, noteRequest, context);
			isolatedNoteCreationTrend.add(Date.now() - startNoteCreation);
			check(noteResponse, { "verify note created response": (r) => r.status === 201 });
		}
	}

	const startNoteRetrieve = Date.now();
	const [notes, noteResponse] = noteClient.getNotes(board.id, context);
	isolatedNoteRetrieveTrend.add(Date.now() - startNoteRetrieve);
	check(noteResponse, { "verify notes are retrieved": (r) => r.status === 200 });
	if (!notes || notes.length === 0) {
		isolatedSuccessRate.add(0);
		return;
	}

	const reactions: ReactionType[] = ["celebration", "dislike", "heart", "joy", "like", "poop", "thinking"];
	for (const note of notes) {
		const reactionRequest: CreateReactionRequest = {
			note: note.id,
			reactionType: reactions[Math.floor(Math.random() * reactions.length)],
		};

		const startReactionCreation = Date.now();
		const [, reactionResponse] = reactionClient.createReaction(board.id, reactionRequest, context);
		isolatedReactionCreation.add(Date.now() - startReactionCreation);
		check(reactionResponse, { "verify reaction created response": (r) => r.status === 201 });
	}

	const votingRequest: CreateVotingRequest = {
		voteLimit: Math.floor(Math.random() * 10),
		allowMultipleVotes: true,
		isAnonymous: false,
		showVotesOfOthers: true,
	};
	const startVotingCreation = Date.now();
	const [voting, votingResponse] = votingClient.createVoting(board.id, votingRequest, context);
	isolatedVotingCreation.add(Date.now() - startVotingCreation);
	check(votingResponse, { "verify voting created response": (r) => r.status === 201 });
	if (!voting) {
		isolatedSuccessRate.add(0);
		return;
	}

	for (let i = 0; i < votingRequest.voteLimit; i++) {
		const voteRequest: CreateVoteRequest = {
			note: notes[Math.floor(Math.random() * notes.length)].id,
		};

		const startVoteCreation = Date.now();
		const [, voteResponse] = voteClient.createVote(board.id, voteRequest, context);
		isolatedVoteCreation.add(Date.now() - startVoteCreation);
		check(voteResponse, { "verify vote created response": (r) => r.status === 201 });
	}

	const startVotingClosing = Date.now();
	const [, closedVotingResponse] = votingClient.updateVoting(board.id, voting.id, { status: "CLOSED" }, context);
	isolatedVotingClosing.add(Date.now() - startVotingClosing);
	check(closedVotingResponse, { "verify voting closed request": (r) => r.status === 200 });

	isolatedSuccessRate.add(1);
}

const collaborativeLoginTrend = new Trend("collaborative_login_duration", true);
const collaborativeJoinTrend = new Trend("collaborative_join_duration", true);
const collaborativeSessionUpdateTrend = new Trend("collaborative_session_update_duration", true);
const collaborativeNoteCreationTrend = new Trend("collaborative_note_creation_duration", true);
const collaborativeNoteRetrieveTrend = new Trend("collaborative_note_retrieve_duration", true);
const collaborativeVotingRetrieveTrend = new Trend("collaborative_voting_retrieve_duration", true);
const collaborativeVotingCreationTrend = new Trend("collaborative_voting_creation_duration", true);
const collaborativeVotingClosingTrend = new Trend("collaborative_voting_closing_duration", true);
const collaborativeTimerCreationTrend = new Trend("collaborative_timer_creation_duration", true);
const collaborativeTimerIncrementTrend = new Trend("collaborative_timer_increment_duration", true);
const collaborativeTimerDeletionTrend = new Trend("collaborative_timer_deletion_duration", true);
const collaborativeVoteCreationTrend = new Trend("collaborative_vote_creation_duration", true);
const collaborativeReactionCreationTrend = new Trend("collaborative_reaction_creation_duration", true);
const collaborativeSuccessRate = new Rate("collaborative_success_rate", false);

export function collaborative(data: SharedBoardData) {
	const { boardId, columnIds, adminToken } = data;
	const adminContext = new http.CookieJar();
	adminContext.set(BASE_URL, "jwt", adminToken);

	const authClient = new AuthClient();
	const boardClient = new BoardClient();
	const noteClient = new NoteClient();
	const reactionClient = new ReactionClient();
	const sessionClient = new SessionClient();
	const votingClient = new VotingClient();
	const voteClient = new VoteClient();

	const context = new http.CookieJar();
	const promoteModerator = exec.vu.idInTest === 1;

	const startlogin = Date.now();
	const [user, authResponse] = authClient.loginAnonymous(
		{ name: `Collaborative-User-${exec.vu.idInTest}-${exec.vu.iterationInScenario}` },
		context,
	);
	collaborativeLoginTrend.add(Date.now() - startlogin);
	check(authResponse, { "verify login response": (r) => r.status === 201 });
	if (!user) {
		collaborativeSuccessRate.add(0);
		return;
	}

	const startJoin = Date.now();
	const joinResponse = boardClient.joinBoard(boardId, {}, context);
	collaborativeJoinTrend.add(Date.now() - startJoin);
	check(joinResponse, { "verify user join request": (r) => r.status === 201 || r.status === 303 });
	if (joinResponse.status !== 201 && joinResponse.status !== 303) {
		collaborativeSuccessRate.add(0);
		return;
	}

	if (promoteModerator) {
		const startSessionUpdate = Date.now();
		const [, sessionResponse] = sessionClient.updateParticipant(boardId, user.id, { role: "MODERATOR" }, adminContext);
		collaborativeSessionUpdateTrend.add(Date.now() - startSessionUpdate);
		check(sessionResponse, { "verify session update response": (r) => r.status === 200 });
	}

	const numberNotesToCreate = Math.floor(1 + Math.random() * 5);
	for (let i = 0; i < numberNotesToCreate; i++) {
		const noteRequest: CreateNoteRequest = {
			column: columnIds[Math.floor(Math.random() * columnIds.length)],
			text: `Note ${i} text for ${exec.vu.idInTest} in iteration ${exec.vu.iterationInScenario} at ${Date.now()}`,
		};

		const startNoteCreation = Date.now();
		const [, noteResponse] = noteClient.createNote(boardId, noteRequest, context);
		collaborativeNoteCreationTrend.add(Date.now() - startNoteCreation);
		check(noteResponse, { "verify note created response": (r) => r.status === 201 });
	}

	const startVotingRetrieve = Date.now();
	const [votings, votingResponse] = votingClient.getVotings(boardId, context);
	collaborativeVotingRetrieveTrend.add(Date.now() - startVotingRetrieve);
	check(votingResponse, { "verify retrieved votings": (r) => r.status === 200 });
	let openVoting = votings?.find((v) => v.status === "OPEN");

	if (!openVoting && promoteModerator) {
		const votingRequest: CreateVotingRequest = {
			voteLimit: 10,
			showVotesOfOthers: true,
			allowMultipleVotes: true,
			isAnonymous: false,
		};

		const startVotingCreation = Date.now();
		const [voting, votingResponse] = votingClient.createVoting(boardId, votingRequest, context);
		collaborativeVotingCreationTrend.add(Date.now() - startVotingCreation);
		check(votingResponse, { "verify voting created response": (r) => r.status === 201 });
		openVoting = voting ?? undefined;
	}

	if (promoteModerator) {
		const startTimerCreation = Date.now();
		const [, boardTimerResponse] = boardClient.setTimer(boardId, { minutes: 42 }, context);
		collaborativeTimerCreationTrend.add(Date.now() - startTimerCreation);
		check(boardTimerResponse, { "verify timer created response": (r) => r.status === 200 });
	}

	const startNoteRetrieve = Date.now();
	const [notes, notesResponse] = noteClient.getNotes(boardId, context);
	collaborativeNoteRetrieveTrend.add(Date.now() - startNoteRetrieve);
	check(notesResponse, { "verify notes received response": (r) => r.status === 200 });

	if (openVoting && notes.length > 0) {
		const numberOfVotes = Math.floor(Math.random() * openVoting.voteLimit);
		for (let i = 0; i < numberOfVotes; i++) {
			const voteRequest: CreateVoteRequest = {
				note: notes[Math.floor(Math.random() * notes.length)].id,
			};

			const startVoteCreation = Date.now();
			const [, voteResponse] = voteClient.createVote(boardId, voteRequest, context);
			collaborativeVoteCreationTrend.add(Date.now() - startVoteCreation);
			check(voteResponse, { "verify vote created response": (r) => r.status === 201 });
		}
	}

	if (promoteModerator) {
		const startTimerIncrement = Date.now();
		const [, boardTimerResponse] = boardClient.incrementTimer(boardId, context);
		collaborativeTimerIncrementTrend.add(Date.now() - startTimerIncrement);
		check(boardTimerResponse, { "verify timer increment response": (r) => r.status === 200 });
	}

	if (notes.length > 0) {
		const reactions: ReactionType[] = ["celebration", "dislike", "heart", "joy", "like", "poop", "thinking"];
		const numberOfReactions = Math.floor(Math.random() * 5);
		for (let i = 0; i < numberOfReactions; i++) {
			const reactionRequest: CreateReactionRequest = {
				note: notes[Math.floor(Math.random() * notes.length)].id,
				reactionType: reactions[Math.floor(Math.random() * reactions.length)],
			};

			const startReactionCreation = Date.now();
			const [, reactionResponse] = reactionClient.createReaction(boardId, reactionRequest, context);
			collaborativeReactionCreationTrend.add(Date.now() - startReactionCreation);
			check(reactionResponse, { "verify reaction created response": (r) => r.status === 201 });
		}
	}

	if (promoteModerator) {
		const startTimerDeletion = Date.now();
		const [, boardTimerResponse] = boardClient.deleteTimer(boardId, context);
		collaborativeTimerDeletionTrend.add(Date.now() - startTimerDeletion);
		check(boardTimerResponse, { "verify timer deleted response": (r) => r.status === 200 });
	}

	const closeVoting = Math.floor(Math.random() * 3) === 1;
	if (openVoting && promoteModerator && closeVoting) {
		const startVotingClosing = Date.now();
		const [, votingResponse] = votingClient.updateVoting(boardId, openVoting.id, { status: "CLOSED" }, context);
		collaborativeVotingClosingTrend.add(Date.now() - startVotingClosing);
		check(votingResponse, { "verify voting update response": (r) => r.status === 200 });
	}

	collaborativeSuccessRate.add(1);
}
