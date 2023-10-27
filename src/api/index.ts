import {AuthAPI} from "api/auth";
import {BoardAPI} from "api/board";
import {NoteAPI} from "api/note";
import {ReactionAPI} from "api/reaction";
import {ColumnAPI} from "api/column";
import {VoteAPI} from "api/vote";
import {VotingAPI} from "api/votings";
import {ParticipantsAPI} from "api/participant";
import {RequestAPI} from "api/request";
import {InfoAPI} from "api/info";
import {UserAPI} from "api/user";
import {AssignmentAPI} from "api/assignment";

/** This class lists all API functions of the server. */
export const API = {
  ...InfoAPI,
  ...AuthAPI,
  ...BoardAPI,
  ...ParticipantsAPI,
  ...RequestAPI,
  ...ColumnAPI,
  ...NoteAPI,
  ...ReactionAPI,
  ...VoteAPI,
  ...VotingAPI,
  ...UserAPI,
  ...AssignmentAPI,
};
