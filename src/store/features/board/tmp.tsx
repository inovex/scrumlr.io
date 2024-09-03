import Socket from "sockette";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {SERVER_WEBSOCKET_URL} from "../../../config";
import {ServerEvent} from "../../../types/websocket";
import store from "../../index";
import {initializeBoard, updatedBoard, updatedBoardTimer} from "./actions";
import {deletedColumn, updateColumns} from "../columns";
import {deletedNote, syncNotes, updatedNotes} from "../notes";
import {addedReaction, deletedReaction, updatedReaction} from "../reactions";
import {createdParticipant, setParticipants, updatedParticipant} from "../participants";
import {createdVoting, updatedVoting} from "../votings";
import {updatedVotes} from "../votes";
import {createJoinRequest, updateJoinRequest} from "../requests";
import {addedBoardReaction, removeBoardReaction} from "../boardReactions";
import {ApplicationState} from "../../../types";
import {API} from "../../../api";

let socket: Socket | null = null;

export const leaveBoard = () => async () => {
  socket?.close();
};

export const permittedBoardAccess = createAsyncThunk("scrumlr.io/permittedBoardAccess", async (boardId: string, {dispatch}) => {
  socket = new Socket(`${SERVER_WEBSOCKET_URL}/boards/${boardId}`, {
    timeout: 5000,
    maxAttempts: 0,
    onmessage: async (evt: MessageEvent<string>) => {
      const message: ServerEvent = JSON.parse(evt.data);

      if (message.type === "INIT") {
        const {board, columns, participants, notes, reactions, votes, votings, requests} = message.data;
        dispatch(
          initializeBoard({
            board,
            columns,
            notes: notes ?? [],
            participants,
            reactions: reactions ?? [],
            requests: requests ?? [],
            votes: votes ?? [],
            votings: votings ?? [],
          })
        );
      }

      if (message.type === "BOARD_UPDATED") {
        dispatch(updatedBoard(message.data));
      }

      if (message.type === "BOARD_TIMER_UPDATED") {
        dispatch(updatedBoardTimer(message.data));
      }

      if (message.type === "BOARD_DELETED") {
        dispatch(leaveBoard());
        window.location.assign("/?boardDeleted=true");
      }

      if (message.type === "COLUMNS_UPDATED") {
        const columns = message.data;
        dispatch(updateColumns(columns));
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
        dispatch(updatedParticipant(message.data));
      }
      if (message.type === "PARTICIPANTS_UPDATED") {
        dispatch(setParticipants(message.data));
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
        setTimeout(() => store.dispatch(removeBoardReaction(message.data.id)), 5000);
      }
    },
  });
});

// TODO edit board

export const setTimer = createAsyncThunk<void, number, {state: ApplicationState}>("scrumlr.io/setTimer", async (payload: number, {getState}) => {
  const {id} = getState().board.data!;
  await API.setTimer(id, payload);
});

export const cancelTimer = createAsyncThunk<void, void, {state: ApplicationState}>("scrumlr.io/setTimer", async (_payload, {getState}) => {
  const {id} = getState().board.data!;
  await API.deleteTimer(id);
});

export const incrementTimer = createAsyncThunk<void, void, {state: ApplicationState}>("scrumlr.io/setTimer", async (_payload, {getState}) => {
  const {id} = getState().board.data!;
  await API.incrementTimer(id);
});

// TODO share note
// TODO stop sharing
// TODO delete board

// TODO other actions
