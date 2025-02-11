import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "api";
import {Session} from "./types";

export const getSessions = createAsyncThunk<Session[], void, {state: ApplicationState}>("sessions/getSessions", async () => {
  const sessions = await API.getSessions();
  return sessions;
});

// TODO: i dont think works, i dont think there's sth behind that url. it should delete a board then right?
export const deleteSession = createAsyncThunk<string, {id: string}, {state: ApplicationState}>("sessions/deleteSession", async (payload) => {
  await API.deleteSession(payload.id);
  return payload.id; // return former id to remove entries from store
});

// TODO: hier muessen auch die ganzen anderen notes usw reingeladen werden, die vorherigen participants maybe?
export const createBoardFromSession = createAsyncThunk<string, Session>("board/createBoardFromSession", async (payload) =>
  API.createBoard(payload.name, {type: payload.accessPolicy}, payload.columns)
);
