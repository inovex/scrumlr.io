import {AuthAPI} from "api/auth";
import {BoardAPI} from "api/board";
import {NoteAPI} from "api/note";
import {ColumnAPI} from "api/column";
import {VoteAPI} from "api/vote";
import {VotingAPI} from "api/votings";
import {ParticipantsAPI} from "./participant";
import {RequestAPI} from "./request";
import {InfoAPI} from "./info";

/** This class lists all API functions of the server. */
export const API = {
  ...InfoAPI,
  ...AuthAPI,
  ...BoardAPI,
  ...ParticipantsAPI,
  ...RequestAPI,
  ...ColumnAPI,
  ...NoteAPI,
  ...VoteAPI,
  ...VotingAPI,
};
