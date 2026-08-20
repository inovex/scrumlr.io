import Socket from "sockette";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {SERVER_WEBSOCKET_URL} from "config";
import {ServerEvent, ClientMessage} from "types/websocket";
import {API} from "api";
import {Timer} from "utils/timer";
import {ApplicationState, retryable} from "store";
import i18n from "i18n";
import {Toast} from "utils/Toast";
import {findParticipantById, mapMultipleParticipants, mapSingleParticipant} from "utils/participant";
import {dynamicTemplatesKey} from "utils/i18n";
import {initializeBoard, updatedBoard, updatedBoardTimer} from "./actions";
import {deletedColumn, updatedColumns} from "../columns";
import {deletedNote, syncNotes, updatedNotes} from "../notes";
import {addedReaction, deletedReaction, updatedReaction} from "../reactions";
import {createdParticipant, setParticipants, updatedParticipant} from "../participants";
import {createdVoting, updatedVoting} from "../votings";
import {deletedVotes} from "../votes";
import {createJoinRequest, updateJoinRequest} from "../requests";
import {addedBoardReaction, removeBoardReaction} from "../boardReactions";
import {noteDragStarted, noteDragEnded} from "../dragLocks";
import {BoardImportData, CreateSessionAccessPolicy, EditBoardRequest, ImportBoardResponse} from "./types";
import {TemplateWithColumns} from "../templates";
import {Column} from "store/features/columns/types";
import {Note} from "store/features/notes/types";
import {Reaction} from "store/features/reactions/types";
import {Request} from "store/features/requests/types";
import {Vote} from "store/features/votes/types";
import {Voting} from "store/features/votings/types";
import {Auth} from "store/features/auth/types";

// helper function to handle board deletion redirects
const redirectToBoardDeletedPage = () => {
  window.location.replace("/?boardDeleted=true");
};

let socket: Socket | null = null;

// Function to send WebSocket messages using sockette's json method
export const sendWebSocketMessage = (message: ClientMessage) => {
  if (socket) {
    socket.json(message);
  }
};

// creates a board from a template and returns board id if successful
export const createBoardFromTemplate = createAsyncThunk<
  string,
  {
    templateWithColumns: TemplateWithColumns;
    accessPolicy: CreateSessionAccessPolicy;
  }
>("board/createBoardFromTemplate", async (payload, {dispatch}) => {
  // finally, translate names and descriptions, since only the keys were stored until this point
  const translateRecommendedTemplate = (toBeTranslated: TemplateWithColumns): TemplateWithColumns => ({
    template: {
      ...toBeTranslated.template,
      name: i18n.t(dynamicTemplatesKey(toBeTranslated.template.name), {ns: "templates"}),
      description: i18n.t(dynamicTemplatesKey(toBeTranslated.template.description), {ns: "templates"}),
    },
    columns: toBeTranslated.columns.map((toBeTranslatedColumn) => ({
      ...toBeTranslatedColumn,
      name: i18n.t(dynamicTemplatesKey(toBeTranslatedColumn.name), {ns: "templates"}),
      description: i18n.t(dynamicTemplatesKey(toBeTranslatedColumn.description), {ns: "templates"}),
    })),
  });

  const translatedTemplateWithColumns =
    payload.templateWithColumns.template.type === "RECOMMENDED" ? translateRecommendedTemplate(payload.templateWithColumns) : payload.templateWithColumns;

  try {
    return await API.createBoard(
      translatedTemplateWithColumns.template.name,
      translatedTemplateWithColumns.template.description,
      payload.accessPolicy,
      translatedTemplateWithColumns.columns
    );
  } catch (error) {
    Toast.error({
      title: i18n.t("Error.createBoard"),
      buttons: [i18n.t("Error.retry")],
      firstButtonOnClick: () => dispatch(createBoardFromTemplate(payload)),
    });
    throw error;
  }
});

export const leaveBoard = createAsyncThunk("board/leaveBoard", async () => {
  if (socket) {
    socket.close();
    socket = null;
  }
});

// generic args: <returnArg, payloadArg, otherArgs(like state type)
export const permittedBoardAccess = createAsyncThunk<
  void,
  string,
  {
    state: ApplicationState;
  }
>("board/permittedBoardAccess", async (boardId: string, {dispatch, getState}) => {
  const {serverTimeOffset} = getState().view;
  const self = getState().auth.user!;
  socket = new Socket(`${SERVER_WEBSOCKET_URL}/boards/${boardId}`, {
    timeout: 5000,
    maxAttempts: 0,
    onmessage: async (evt: MessageEvent<string>) => {
      const message: ServerEvent = JSON.parse(evt.data);

      switch (message.type) {
        case "INIT": {
          const board = await API.getBoard(boardId);
          const columns = await API.getColumns(boardId).catch(() => {
            return [] as Column[];
          });
          const notes = await API.getNotes(boardId).catch(() => {
            return [] as Note[];
          });
          const reactions = await API.getReactions(boardId).catch(() => {
            return [] as Reaction[];
          });
          const votes = await API.getVotes(boardId).catch(() => {
            return [] as Vote[];
          });
          const votings = await API.getVotings(boardId).catch(() => {
            return [] as Voting[];
          });
          const userAuth = await API.getUsers(boardId).catch(() => {
            return [] as Auth[];
          });
          const participants = await API.getParticipants(boardId);
          const newParticipants = mapMultipleParticipants(participants, userAuth);
          let requests: Request[] = [];
          if (newParticipants.find((p) => p.user.id === self.id)?.role == "MODERATOR" || newParticipants.find((p) => p.user.id === self.id)?.role == "OWNER") {
            requests = await API.getRequests(boardId).catch(() => {
              return [] as Request[];
            });
          }

          dispatch(
            initializeBoard({
              fullBoard: {
                board,
                columns,
                notes: notes ?? [],
                participants: newParticipants,
                reactions: reactions ?? [],
                requests: requests ?? [],
                votes: votes ?? [],
                votings: votings ?? [],
              },
              serverTimeOffset,
              self,
            })
          );
          break;
        }

        case "BOARD_UPDATED": {
          dispatch(updatedBoard({board: message.data, serverTimeOffset}));
          break;
        }

        case "BOARD_TIMER_UPDATED": {
          dispatch(updatedBoardTimer({board: message.data, serverTimeOffset}));
          break;
        }

        case "BOARD_DELETED": {
          dispatch(leaveBoard());
          redirectToBoardDeletedPage();
          break;
        }

        case "COLUMNS_UPDATED": {
          const columns = message.data;
          dispatch(updatedColumns(columns));
          break;
        }

        case "COLUMN_DELETED": {
          const {column, notes} = message.data;
          dispatch(deletedColumn(column));
          notes.forEach((noteId) => dispatch(deletedNote(noteId)));
          break;
        }

        case "NOTES_UPDATED": {
          const notes = message.data;
          dispatch(updatedNotes(notes));
          break;
        }

        case "NOTE_DELETED": {
          const noteIds = message.data;
          noteIds.forEach((noteId) => dispatch(deletedNote(noteId)));
          break;
        }

        case "REACTION_ADDED": {
          const reaction = message.data;
          dispatch(addedReaction(reaction));
          break;
        }

        case "REACTION_DELETED": {
          const reactionId = message.data;
          dispatch(deletedReaction(reactionId));
          break;
        }

        case "REACTION_UPDATED": {
          const reaction = message.data;
          dispatch(updatedReaction(reaction));
          break;
        }

        case "NOTES_SYNC": {
          const notes = message.data;
          dispatch(syncNotes(notes ?? []));
          break;
        }

        case "PARTICIPANT_CREATED": {
          const user = await API.getUserById(message.data.id);
          const participant = mapSingleParticipant(message.data, user);
          dispatch(createdParticipant(participant));
          break;
        }

        case "PARTICIPANT_UPDATED": {
          const participant = findParticipantById(getState().participants, message.data.id);
          if (participant) {
            dispatch(
              updatedParticipant({
                participant: {...participant, user: message.data},
                self: getState().auth.user!,
              })
            );
          }
          break;
        }

        case "PARTICIPANTS_UPDATED": {
          const userAuth = await API.getUsers(getState().board.data!.id);
          const participants = mapMultipleParticipants(message.data, userAuth);
          dispatch(
            setParticipants({
              participants,
              self: getState().auth.user!,
            })
          );
          break;
        }

        case "SESSION_UPDATED": {
          const participant = findParticipantById(getState().participants, message.data.id);
          if (participant) {
            dispatch(
              updatedParticipant({
                participant: mapSingleParticipant(message.data, participant.user),
                self: getState().auth.user!,
              })
            );
          }
          break;
        }

        case "VOTING_CREATED": {
          dispatch(createdVoting(message.data));
          break;
        }

        case "VOTING_UPDATED": {
          dispatch(updatedVoting({voting: message.data.voting, notes: message.data.notes}));
          break;
        }

        case "VOTES_DELETED": {
          const votes = message.data;
          dispatch(deletedVotes(votes));
          break;
        }

        case "REQUEST_CREATED": {
          dispatch(createJoinRequest(message.data));
          break;
        }

        case "REQUEST_UPDATED": {
          dispatch(updateJoinRequest(message.data));
          break;
        }

        case "BOARD_REACTION_ADDED": {
          const boardReaction = message.data;
          dispatch(addedBoardReaction(boardReaction));
          setTimeout(() => dispatch(removeBoardReaction(boardReaction.id)), 5000);
          break;
        }

        case "NOTE_DRAG_START": {
          const {noteId, userId} = message.data;
          dispatch(noteDragStarted({noteId, userId}));
          break;
        }

        case "NOTE_DRAG_END": {
          const {noteId, userId} = message.data;
          dispatch(noteDragEnded({noteId, userId}));
          break;
        }

        default:
          break;
      }
    },
  });
});

export const editBoard = createAsyncThunk<
  void,
  EditBoardRequest,
  {
    state: ApplicationState;
  }
>("board/editBoard", async (payload, {dispatch, getState}) => {
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

export const setTimer = createAsyncThunk<
  void,
  number,
  {
    state: ApplicationState;
  }
>("board/setTimer", async (payload, {getState}) => {
  const {id} = getState().board.data!;
  await API.setTimer(id, payload);
});

export const cancelTimer = createAsyncThunk<
  void,
  void,
  {
    state: ApplicationState;
  }
>("board/cancelTimer", async (_payload, {getState}) => {
  const {id} = getState().board.data!;
  await API.deleteTimer(id);
});

export const incrementTimer = createAsyncThunk<
  void,
  void,
  {
    state: ApplicationState;
  }
>("board/incrementTimer", async (_payload, {getState}) => {
  const {id} = getState().board.data!;
  await API.incrementTimer(id);
});

export const shareNote = createAsyncThunk<
  void,
  string,
  {
    state: ApplicationState;
  }
>("board/shareNote", async (payload, {dispatch, getState}) => {
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

export const stopSharing = createAsyncThunk<
  void,
  void,
  {
    state: ApplicationState;
  }
>("board/shareNote", async (_payload, {dispatch, getState}) => {
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

export const deleteBoard = createAsyncThunk<
  void,
  void,
  {
    state: ApplicationState;
  }
>("board/deleteBoard", async (_payload, {dispatch, getState}) => {
  const {id} = getState().board.data!;
  retryable(() => API.deleteBoard(id), dispatch, deleteBoard, "deleteBoard").then(() => {
    redirectToBoardDeletedPage();
  });
});
export const importBoard = createAsyncThunk<ImportBoardResponse, BoardImportData, {state: ApplicationState}>("board/importBoard", async (payload, {dispatch}) => {
  try {
    return await API.importBoard(payload);
  } catch (error) {
    Toast.error({
      title: i18n.t("Error.importBoard"),
      buttons: [i18n.t("Error.retry")],
      firstButtonOnClick: () => dispatch(importBoard(payload)),
    });
    throw error;
  }
});
