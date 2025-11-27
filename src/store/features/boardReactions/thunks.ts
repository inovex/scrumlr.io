import {createAsyncThunk} from "@reduxjs/toolkit";
import {API} from "api";
import {ApplicationState} from "store";

export const addBoardReaction = createAsyncThunk<void, string, {state: ApplicationState}>("boardReactions/addBoardReaction", async (payload, {getState}) => {
  const {id} = getState().board.data!;
  await API.addBoardReaction(id, payload);
});
