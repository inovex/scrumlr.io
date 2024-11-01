import Socket from "sockette";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {SERVER_WEBSOCKET_URL} from "config";
import {ServerEvent} from "types/websocket";
import {API} from "api";
import {Timer} from "utils/timer";
import {ApplicationState, retryable} from "store";
import {initializeBoard, updatedBoard, updatedBoardTimer} from "./actions";
import {deletedColumn, updatedColumns} from "../columns";
import {deletedNote, syncNotes, updatedNotes} from "../notes";
import {addedReaction, deletedReaction, updatedReaction} from "../reactions";
import {createdParticipant, setParticipants, updatedParticipant} from "../participants";
import {createdVoting, updatedVoting} from "../votings";
import {updatedVotes} from "../votes";
import {createJoinRequest, updateJoinRequest} from "../requests";
import {addedBoardReaction, removeBoardReaction} from "../boardReactions";
import {EditBoardRequest} from "./types";
import {TemplateWithColumns} from "../templates";

let socket: Socket | null = null;

// creates a board from a template and returns board id if successful
export const createBoardFromTemplate = createAsyncThunk<string, TemplateWithColumns>("board/createBoardFromTemplate", async (payload) =>
  API.createBoard(payload.name, {type: payload.accessPolicy}, payload.columns)
);

export const leaveBoard = createAsyncThunk("board/leaveBoard", async () => {
  if (socket) {
    socket.close();
    socket = null;
  }
});

// generic args: <returnArg, payloadArg, otherArgs(like state type)
export const permittedBoardAccess = createAsyncThunk<void, string, {state: ApplicationState}>("board/permittedBoardAccess", async (boardId: string, {dispatch, getState}) => {
  const {serverTimeOffset} = getState().view;
  const self = getState().auth.user!;
  socket = new Socket(`${SERVER_WEBSOCKET_URL}/boards/${boardId}`, {
    timeout: 5000,
    maxAttempts: 0,
    onmessage: async (evt: MessageEvent<string>) => {
      const message: ServerEvent = JSON.parse(evt.data);

      if (message.type === "INIT") {
        const {board, columns, participants, notes, reactions, votes, votings, requests} = message.data;
        dispatch(
          initializeBoard({
            fullBoard: {
              board,
              columns,
              notes: notes ?? [],
              participants,
              reactions: reactions ?? [],
              requests: requests ?? [],
              votes: votes ?? [],
              votings: votings ?? [],
            },
            serverTimeOffset,
            self,
          })
        );
      }

      if (message.type === "BOARD_UPDATED") {
        dispatch(updatedBoard({board: message.data, serverTimeOffset}));
      }

      if (message.type === "BOARD_TIMER_UPDATED") {
        dispatch(updatedBoardTimer({board: message.data, serverTimeOffset}));
      }

      if (message.type === "BOARD_DELETED") {
        dispatch(leaveBoard());
        window.location.assign("/?boardDeleted=true");
      }

      if (message.type === "COLUMNS_UPDATED") {
        const columns = message.data;
        dispatch(updatedColumns(columns));
      }

      if (message.type === "COLUMN_DELETED") {
        const columnId = message.data;
        dispatch(deletedColumn(columnId));
      }

      if (message.type === "NOTES_UPDATED") {
        const notes = message.data;
        dispatch(updatedNotes(notes));
      }
      if (message.type === "NOTE_DELETED") {
        const noteId = message.data.note;
        const {deleteStack} = message.data;
        dispatch(deletedNote({noteId, deleteStack}));
      }
      if (message.type === "REACTION_ADDED") {
        const reaction = message.data;
        dispatch(addedReaction(reaction));
      }
      if (message.type === "REACTION_DELETED") {
        const reactionId = message.data;
        dispatch(deletedReaction(reactionId));
      }
      if (message.type === "REACTION_UPDATED") {
        const reaction = message.data;
        dispatch(updatedReaction(reaction));
      }
      if (message.type === "NOTES_SYNC") {
        const notes = message.data;
        dispatch(syncNotes(notes ?? []));
      }
      if (message.type === "PARTICIPANT_CREATED") {
        dispatch(createdParticipant(message.data));
      }
      if (message.type === "PARTICIPANT_UPDATED") {
        dispatch(updatedParticipant({participant: message.data, self: getState().auth.user!}));
      }
      if (message.type === "PARTICIPANTS_UPDATED") {
        dispatch(setParticipants({participants: message.data, self: getState().auth.user!}));
      }

      if (message.type === "VOTING_CREATED") {
        dispatch(createdVoting(message.data));
      }
      if (message.type === "VOTING_UPDATED") {
        dispatch(updatedVoting({voting: message.data.voting, notes: message.data.notes}));
      }

      if (message.type === "VOTES_UPDATED") {
        const votes = message.data;
        dispatch(updatedVotes(votes));
      }

      if (message.type === "REQUEST_CREATED") {
        dispatch(createJoinRequest(message.data));
      }
      if (message.type === "REQUEST_UPDATED") {
        dispatch(updateJoinRequest(message.data));
      }
      if (message.type === "BOARD_REACTION_ADDED") {
        dispatch(addedBoardReaction(message.data));
        setTimeout(() => dispatch(removeBoardReaction(message.data.id)), 5000);
      }
    },
  });
});

export const editBoard = createAsyncThunk<void, EditBoardRequest, {state: ApplicationState}>("board/editBoard", async (payload, {dispatch, getState}) => {
  const board = getState().board.data!;
  const {serverTimeOffset} = getState().view;
  await retryable(
    () =>
      API.editBoard(board.id, {
        sharedNote: board.sharedNote,
        showVoting: board.showVoting,
        timerStart: Timer.removeOffsetFromDate(board.timerStart, serverTimeOffset),
        timerEnd: Timer.removeOffsetFromDate(board.timerEnd, serverTimeOffset),
        accessPolicy: payload.accessPolicy,
        passphrase: payload.passphrase,
        allowStacking: payload.allowStacking,
        showAuthors: payload.showAuthors,
        showNotesOfOtherUsers: payload.showNotesOfOtherUsers,
        showNoteReactions: payload.showNoteReactions,
        name: payload.name == null ? board.name : payload.name,
        isLocked: payload.isLocked,
      }),
    dispatch,
    () => editBoard({...payload}),
    "editBoard"
  );
});

export const setTimer = createAsyncThunk<void, number, {state: ApplicationState}>("board/setTimer", async (payload, {getState}) => {
  const {id} = getState().board.data!;
  await API.setTimer(id, payload);
});

export const cancelTimer = createAsyncThunk<void, void, {state: ApplicationState}>("board/cancelTimer", async (_payload, {getState}) => {
  const {id} = getState().board.data!;
  await API.deleteTimer(id);
});

export const incrementTimer = createAsyncThunk<void, void, {state: ApplicationState}>("board/incrementTimer", async (_payload, {getState}) => {
  const {id} = getState().board.data!;
  await API.incrementTimer(id);
});

export const shareNote = createAsyncThunk<void, string, {state: ApplicationState}>("board/shareNote", async (payload, {dispatch, getState}) => {
  const board = getState().board.data!;
  const {serverTimeOffset} = getState().view;
  const note = getState().notes.find((n) => n.id === payload);
  const column = getState().columns.find((c) => c.id === note?.position.column);

  if (!column?.visible) return; // do not share notes in hidden columns

  await retryable(
    () =>
      API.editBoard(board.id, {
        sharedNote: payload,
        showVoting: board.showVoting,
        timerStart: Timer.removeOffsetFromDate(board.timerStart, serverTimeOffset),
        timerEnd: Timer.removeOffsetFromDate(board.timerEnd, serverTimeOffset),
      }),
    dispatch,
    () => shareNote(payload),
    "shareNote"
  );
});

export const stopSharing = createAsyncThunk<void, void, {state: ApplicationState}>("board/shareNote", async (_payload, {dispatch, getState}) => {
  const board = getState().board.data!;
  const {serverTimeOffset} = getState().view;

  await retryable(
    () =>
      API.editBoard(board.id, {
        sharedNote: undefined,
        showVoting: board.showVoting,
        timerStart: Timer.removeOffsetFromDate(board.timerStart, serverTimeOffset),
        timerEnd: Timer.removeOffsetFromDate(board.timerEnd, serverTimeOffset),
      }),
    dispatch,
    stopSharing,
    "unshareNote"
  );
});

export const deleteBoard = createAsyncThunk<void, void, {state: ApplicationState}>("board/deleteBoard", async (_payload, {dispatch, getState}) => {
  const {id} = getState().board.data!;
  retryable(() => API.deleteBoard(id), dispatch, deleteBoard, "deleteBoard").then(() => {
    document.location.pathname = "/";
  });
});
