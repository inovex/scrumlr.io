import {combineReducers, configureStore, Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {TypedUseSelectorHook, useSelector} from "react-redux";
import {ApplicationState} from "types";
import {ReduxAction} from "./action";
import {boardReducer} from "./features/board/reducer";
import {noteReducer} from "./features/notes/reducer";
import {voteReducer} from "./features/votes/reducer";
import {participantsReducer} from "./features/participants/reducer";
import {votingReducer} from "./features/votings/reducer";
import {passNoteMiddleware} from "./features/notes/note";
import {passVoteMiddleware} from "./features/votes/vote";
import {passBoardMiddleware} from "./features/board/board";
import {passColumnMiddleware} from "./features/columns/column";
import {passParticipantsMiddleware} from "./features/participants/participants";
import {joinRequestReducer} from "./features/requests/reducer";
import {passVotingMiddleware} from "./features/votings/votings";
import {authReducer} from "./features/auth/reducer";
import {passAuthMiddleware} from "./features/auth/thunks";
import {columnsReducer} from "./features/columns/reducer";
import {viewReducer} from "./features/view/reducer";
import {passRequestMiddleware} from "./features/requests/request";
import {passViewMiddleware} from "./features/view/view";
import {boardReactionReducer} from "./features/boardReactions/reducer";
import {passBoardReactionMiddleware} from "./features/boardReactions/boardReaction";
import {reactionReducer} from "./features/reactions/reducer";
import {passReactionMiddleware} from "./features/reactions/reaction";
import {passSkinToneMiddleware} from "./features/skinTone/skinTone";
import {skinToneReducer} from "./features/skinTone/reducer";

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
