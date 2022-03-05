import {createStore, applyMiddleware, combineReducers, Dispatch, MiddlewareAPI} from "redux";
import {TypedUseSelectorHook, useSelector} from "react-redux";
import thunk from "redux-thunk";
import {composeWithDevTools} from "redux-devtools-extension";
import {ApplicationState} from "types";
import {ReduxAction} from "./action";
import {boardReducer} from "./reducer/board";
import {noteReducer} from "./reducer/note";
import {voteReducer} from "./reducer/vote";
import {usersReducer} from "./reducer/participants";
import {votingReducer} from "./reducer/votings";
import {passNoteMiddleware} from "./middleware/note";
import {passVoteMiddlware} from "./middleware/vote";
import {passBoardMiddleware} from "./middleware/board";
import {passColumnMiddleware} from "./middleware/column";
import {passUsersMiddleware} from "./middleware/participants";
import {joinRequestReducer} from "./reducer/requests";
import {passVoteConfigurationMiddleware} from "./middleware/votings";
import {authReducer} from "./reducer/auth";
import {passAuthMiddleware} from "./middleware/auth";
import {columnsReducer} from "./reducer/columns";

const parseMiddleware = (stateAPI: MiddlewareAPI<Dispatch, ApplicationState>) => (dispatch: Dispatch) => (action: ReduxAction) => {
  try {
    return dispatch(action);
  } finally {
    passBoardMiddleware(stateAPI, dispatch, action);
    passColumnMiddleware(stateAPI, dispatch, action);
    passVoteConfigurationMiddleware(stateAPI, dispatch, action);
    passNoteMiddleware(stateAPI, dispatch, action);
    passVoteMiddlware(stateAPI, dispatch, action);
    passAuthMiddleware(stateAPI, dispatch, action);
    passUsersMiddleware(stateAPI, dispatch, action);
  }
};

const rootReducer = combineReducers<ApplicationState>({
  board: boardReducer,
  columns: columnsReducer,
  notes: noteReducer,
  auth: authReducer,
  participants: usersReducer,
  requests: joinRequestReducer,
  votes: voteReducer,
  votings: votingReducer,
});

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk), applyMiddleware(parseMiddleware)));

export default store;

type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
