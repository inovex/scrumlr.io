import {BoardAPI} from "./board";
import {NoteAPI} from "./note";
import {ColumnAPI} from "./column";
import {VoteAPI} from "./vote";
import {VoteConfigurationAPI} from "./voteConfiguration";
import {UserAPI} from "./user";

/** This class lists all API functions of the server. */
export const API = {
  ...BoardAPI,
  ...ColumnAPI,
  ...NoteAPI,
  ...VoteAPI,
  ...VoteConfigurationAPI,
  ...UserAPI,
};
