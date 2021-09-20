import {BoardAPI} from "./board";
import {NoteAPI} from "./note";
import {ColumnAPI} from "./column";
import {VoteAPI} from "./vote";
import {AuthAPI} from "./auth";
import {UserAPI} from "./user";

/** This class lists all API functions of the server. */
export const API = {
  ...BoardAPI,
  ...ColumnAPI,
  ...NoteAPI,
  ...VoteAPI,
  ...AuthAPI,
  ...UserAPI,
};
