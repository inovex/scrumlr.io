import {createStore, applyMiddleware, combineReducers, Dispatch, MiddlewareAPI, AnyAction} from "redux";
import thunk from "redux-thunk";
import {composeWithDevTools} from "redux-devtools-extension";
import {ApplicationState} from "../types/store";
import {ReduxAction} from "./action";
import {boardReducer} from "./reducer/board";
import {noteReducer} from "./reducer/note";
import {usersReducer} from "./reducer/users";
import {passNoteMiddleware} from "./middleware/note";
import {passBoardMiddleware} from "./middleware/board";
import {passBoardJoinConfirmationMiddleware} from "./middleware/boardJoinConfirmation";
import {passColumnMiddleware} from "./middleware/column";
import {passJoinRequestMiddleware} from "./middleware/joinRequest";
import {joinRequestReducer} from "./reducer/joinRequest";
import {cookieReducer} from "./reducer/cookie";

const parseMiddleware = (stateAPI: MiddlewareAPI<Dispatch<AnyAction>, ApplicationState>) => (dispatch: Dispatch) => (action: ReduxAction) => {
  try {
    return dispatch(action);
  } finally {
    passBoardJoinConfirmationMiddleware(stateAPI, dispatch, action);
    passBoardMiddleware(stateAPI, dispatch, action);
    passColumnMiddleware(stateAPI, dispatch, action);
    passNoteMiddleware(stateAPI, dispatch, action);
    passJoinRequestMiddleware(stateAPI, dispatch, action);
  }
};

const rootReducer = combineReducers<ApplicationState>({
  board: boardReducer,
  notes: noteReducer,
  users: usersReducer,
  cookieConsent: cookieReducer,
  joinRequests: joinRequestReducer,
});

const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk), applyMiddleware(parseMiddleware)));

export default store;
