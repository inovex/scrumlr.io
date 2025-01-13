import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "api";
import {Session} from "./types";
// import {getTemplateColumns} from "../templateColumns/thunks";

export const getSessions = createAsyncThunk<Session[], void, {state: ApplicationState}>("sessions/getSessions", async () => {
  const sessions = await API.getSessions();
  return sessions;
});

// TODO: i dont think works, i dont think there's sth behind that url. it should delete a board then right?
export const deleteSession = createAsyncThunk<string, {id: string}, {state: ApplicationState}>("sessions/deleteSession", async (payload) => {
  await API.deleteSession(payload.id);
  return payload.id; // return former id to remove entries from store
});
