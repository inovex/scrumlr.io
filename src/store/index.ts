import {createStore, applyMiddleware, combineReducers, Dispatch, MiddlewareAPI, AnyAction} from "redux";
import {TypedUseSelectorHook, useSelector} from "react-redux";
import thunk from "redux-thunk";
import {composeWithDevTools} from "redux-devtools-extension";
import {ApplicationState} from "types/store";
import {ReduxAction} from "./action";
import {boardReducer} from "./reducer/board";
import {noteReducer} from "./reducer/note";
import {voteReducer} from "./reducer/vote";
import {usersReducer} from "./reducer/participants";
import {votingReducer} from "./reducer/votings";
import {passNoteMiddleware} from "./middleware/note";
import {passVoteMiddlware} from "./middleware/vote";
import {passBoardMiddleware} from "./middleware/board";
import {passBoardJoinConfirmationMiddleware} from "./middleware/boardJoinConfirmation";
import {passColumnMiddleware} from "./middleware/column";
import {passJoinRequestMiddleware} from "./middleware/joinRequest";
import {passUsersMiddleware} from "./middleware/participants";
import {joinRequestReducer} from "./reducer/joinRequest";
import {passVoteConfigurationMiddleware} from "./middleware/votings";
import {userReducer} from "./reducer/user";
import {passUserMiddleware} from "./middleware/user";
import {columnsReducer} from "./reducer/columns";

const parseMiddleware = (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>) => (dispatch: Dispatch) => (action: ReduxAction) => {
  try {
    return dispatch(action);
  } finally {
    passBoardJoinConfirmationMiddleware(stateAPI, dispatch, action);
    passBoardMiddleware(stateAPI, dispatch, action);
    passColumnMiddleware(stateAPI, dispatch, action);
    passVoteConfigurationMiddleware(stateAPI, dispatch, action);
    passNoteMiddleware(stateAPI, dispatch, action);
    passVoteMiddlware(stateAPI, dispatch, action);
    passJoinRequestMiddleware(stateAPI, dispatch, action);
    passUserMiddleware(stateAPI, dispatch, action);
    passUsersMiddleware(stateAPI, dispatch, action);
  }
};

const rootReducer = combineReducers<ApplicationState>({
  board: boardReducer,
  columns: columnsReducer,
  notes: noteReducer,
  user: userReducer,
  participants: usersReducer,
  joinRequests: joinRequestReducer,
  votes: voteReducer,
  votings: votingReducer,
});

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk), applyMiddleware(parseMiddleware)));

export default store;

type RootState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
