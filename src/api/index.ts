import {AuthAPI} from "api/auth";
import {BoardAPI} from "api/board";
import {NoteAPI} from "api/note";
import {ColumnAPI} from "api/column";
import {VoteAPI} from "api/vote";
import {VoteConfigurationAPI} from "api/voteConfiguration";
import {UserAPI} from "api/user";

/** This class lists all API functions of the server. */
export const API = {
  ...AuthAPI,
  ...BoardAPI,
  ...ColumnAPI,
  ...NoteAPI,
  ...UserAPI,
  ...VoteAPI,
  ...VoteConfigurationAPI,
};
