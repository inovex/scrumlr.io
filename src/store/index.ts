import {combineReducers, configureStore, Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {TypedUseSelectorHook, useSelector} from "react-redux";
import {ApplicationState} from "types";
import {ReduxAction} from "./action";
import {boardReducer} from "./reducer/board";
import {noteReducer} from "./reducer/note";
import {voteReducer} from "./reducer/vote";
import {participantsReducer} from "./reducer/participants";
import {votingReducer} from "./reducer/votings";
import {passNoteMiddleware} from "./middleware/note";
import {passVoteMiddleware} from "./middleware/vote";
import {passBoardMiddleware} from "./middleware/board";
import {passColumnMiddleware} from "./middleware/column";
import {passParticipantsMiddleware} from "./middleware/participants";
import {joinRequestReducer} from "./reducer/requests";
import {passVotingMiddleware} from "./middleware/votings";
import {authReducer} from "./reducer/auth";
import {passAuthMiddleware} from "./middleware/auth";
import {columnsReducer} from "./reducer/columns";
import {viewReducer} from "./reducer/view";
import {passRequestMiddleware} from "./middleware/request";
import {passViewMiddleware} from "./middleware/view";
import {assignmentReducer} from "./reducer/assignment";
import {passAssignmentMiddlware} from "./middleware/assignment";
import {boardReactionReducer} from "./reducer/boardReaction";
import {passBoardReactionMiddleware} from "./middleware/boardReaction";
import {reactionReducer} from "./reducer/reaction";
import {passReactionMiddleware} from "./middleware/reaction";
import {passSkinToneMiddleware} from "./middleware/skinTone";
import {skinToneReducer} from "./reducer/skinTone";

const parseMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>) => (dispatch: Dispatch) => (action: ReduxAction) => {
  action.context = {
    user: stateAPI.getState().auth.user?.id,
    board: stateAPI.getState().board.data?.id,
    voting: stateAPI.getState().votings.open?.id,
    serverTimeOffset: stateAPI.getState().view.serverTimeOffset,
  };
  try {
    return dispatch(action);
  } finally {
    passViewMiddleware(stateAPI, dispatch, action);
    passAuthMiddleware(stateAPI, dispatch, action);
    passBoardMiddleware(stateAPI, dispatch, action);
    passParticipantsMiddleware(stateAPI, dispatch, action);
    passRequestMiddleware(stateAPI, dispatch, action);
    passColumnMiddleware(stateAPI, dispatch, action);
    passNoteMiddleware(stateAPI, dispatch, action);
    passReactionMiddleware(stateAPI, dispatch, action);
    passVoteMiddleware(stateAPI, dispatch, action);
    passVotingMiddleware(stateAPI, dispatch, action);
    passAssignmentMiddlware(stateAPI, dispatch, action);
    passBoardReactionMiddleware(stateAPI, dispatch, action);
    passSkinToneMiddleware(stateAPI, dispatch, action);
  }
};

const rootReducer = combineReducers<ApplicationState>({
  board: boardReducer,
  columns: columnsReducer,
  notes: noteReducer,
  reactions: reactionReducer,
  auth: authReducer,
  participants: participantsReducer,
  requests: joinRequestReducer,
  votes: voteReducer,
  votings: votingReducer,
  view: viewReducer,
  assignments: assignmentReducer,
  boardReactions: boardReactionReducer,
  skinTone: skinToneReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(parseMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;

type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
