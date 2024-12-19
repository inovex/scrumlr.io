import {configureStore} from "@reduxjs/toolkit";
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {
  authReducer,
  templatesReducer,
  sessionsReducer,
  templateColumnsReducer,
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
  templates: templatesReducer,
  templatesColumns: templateColumnsReducer,
  board: boardReducer,
  boardReactions: boardReactionsReducer,
  columns: columnsReducer,
  notes: notesReducer,
  participants: participantsReducer,
  reactions: reactionsReducer,
  requests: requestsReducer,
  sessions: sessionsReducer,
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
