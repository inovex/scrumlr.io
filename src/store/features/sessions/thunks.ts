import {createAsyncThunk} from "@reduxjs/toolkit";
import {ApplicationState} from "store";
import {API} from "api";
import {Session} from "./types";
// import {getTemplateColumns} from "../templateColumns/thunks";

export const getSessions = createAsyncThunk<Session[], void, {state: ApplicationState}>("sessions/getSessions", async () => {
  const sessions = await API.getSessions();
  return sessions;
});
