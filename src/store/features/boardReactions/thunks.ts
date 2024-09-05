import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {ApplicationState} from "store";
import {ReactionType} from "../reactions";

export const addBoardReaction = createAsyncThunk<void, ReactionType, {state: ApplicationState}>("scrumlr.io/addBoardReaction", async (payload, {getState}) => {
  const {id} = getState().board.data!;
  await API.addBoardReaction(id, payload);
});
