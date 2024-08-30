import {combineReducers, configureStore, Dispatch, MiddlewareAPI} from "@reduxjs/toolkit";
import {TypedUseSelectorHook, useSelector} from "react-redux";
import {ApplicationState} from "types";
import {ReduxAction} from "./action";
import {boardReducer} from "./features/board/board";
import {noteReducer} from "./features/notes/note";
import {voteReducer} from "./features/votes/vote";
import {participantsReducer} from "./features/participants/participants";
import {votingReducer} from "./features/votings/votings";
import {passNoteMiddleware} from "./middleware/note";
import {passVoteMiddleware} from "./middleware/vote";
import {passBoardMiddleware} from "./middleware/board";
import {passColumnMiddleware} from "./middleware/column";
import {passParticipantsMiddleware} from "./middleware/participants";
import {joinRequestReducer} from "./features/requests/requests";
import {passVotingMiddleware} from "./middleware/votings";
import {authReducer} from "./features/auth/auth";
import {passAuthMiddleware} from "./middleware/auth";
import {columnsReducer} from "./features/columns/columns";
import {viewReducer} from "./features/view/view";
import {passRequestMiddleware} from "./middleware/request";
import {passViewMiddleware} from "./middleware/view";
import {boardReactionReducer} from "./features/boardReactions/boardReaction";
import {passBoardReactionMiddleware} from "./middleware/boardReaction";
import {reactionReducer} from "./features/reactions/reaction";
import {passReactionMiddleware} from "./middleware/reaction";
import {passSkinToneMiddleware} from "./middleware/skinTone";
import {skinToneReducer} from "./features/skinTone/skinTone";

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
