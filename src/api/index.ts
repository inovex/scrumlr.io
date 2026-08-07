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
import {BoardReactionAPI} from "api/boardReaction";
import {TemplatesAPI} from "api/templates";
import {TemplateColumnsAPI} from "api/templateColumns";
import {SERVER_HTTP_URL} from "../config";

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
  ...BoardReactionAPI,
  ...TemplatesAPI,
  ...TemplateColumnsAPI,
};

interface QueryParameter {
  key: string;
  value: string | number | boolean | string[] | number[] | null | undefined;
}

export function buildUrl(path: string, queryParameter: QueryParameter[] = []): URL {
  const url = new URL(path, SERVER_HTTP_URL);
  for (let param of queryParameter) {
    if (param.value !== null && param.value !== undefined) {
      if (Array.isArray(param.value)) {
        param.value.forEach((item) => {
          if (item !== null && item !== undefined) {
            url.searchParams.append(param.key, String(item));
          }
        });
      } else {
        url.searchParams.append(param.key, String(param.value));
      }
    }
  }

  return url;
}
