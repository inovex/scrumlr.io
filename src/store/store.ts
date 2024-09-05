import {configureStore} from "@reduxjs/toolkit";
import {TypedUseSelectorHook, useSelector} from "react-redux";
import {
  authReducer,
  boardReducer,
  boardReactionsReducer,
  columnsReducer,
  notesReducer,
  participantsReducer,
  reactionsReducer,
  requestsReducer,
  skinToneReducer,
  viewReducer,
  votesReducer,
  votingsReducer,
} from "./features";

const rootReducer = {
  auth: authReducer,
  board: boardReducer,
  boardReactions: boardReactionsReducer,
  columns: columnsReducer,
  notes: notesReducer,
  participants: participantsReducer,
  reactions: reactionsReducer,
  requests: requestsReducer,
  skinTone: skinToneReducer,
  view: viewReducer,
  votes: votesReducer,
  votings: votingsReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== "production",
});

export type ApplicationState = ReturnType<typeof store.getState>;
export const useAppSelector: TypedUseSelectorHook<ApplicationState> = useSelector;
