import {configureStore} from "@reduxjs/toolkit";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {
  authReducer,
  templatesReducer,
  templateColumnsReducer,
  boardReducer,
  boardReactionsReducer,
  columnsReducer,
  dragLocksReducer,
  notesReducer,
  participantsReducer,
  reactionsReducer,
  recentEmojisReducer,
  requestsReducer,
  skinToneReducer,
  viewReducer,
  votesReducer,
  votingsReducer,
} from "./features";

export const rootReducer = {
  auth: authReducer,
  templates: templatesReducer,
  templateColumns: templateColumnsReducer,
  board: boardReducer,
  boardReactions: boardReactionsReducer,
  columns: columnsReducer,
  dragLocks: dragLocksReducer,
  notes: notesReducer,
  participants: participantsReducer,
  reactions: reactionsReducer,
  recentEmojis: recentEmojisReducer,
  requests: requestsReducer,
  skinTone: skinToneReducer,
  view: viewReducer,
  votes: votesReducer,
  votings: votingsReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production",
});

export type ApplicationState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<ApplicationState> = useSelector;
export const useAppDispatch: () => AppDispatch = useDispatch;
