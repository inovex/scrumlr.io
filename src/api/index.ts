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

/**
 * Builds the url with the configured server url.
 * The given path should be relative to the configured server url like `./boards`
 * If not the pre configured path from the server url is discarded
 *
 * @example
 *  server url: https://localhost:8080/api
 *  path: ./boards
 *  result: https://localhost:8080/api/boards
 *
 *  server url: https://loclahost:8080/api
 *  path: /boards
 *  result: https://localhost:8080/boards
 *
 * @param path relative path
 * @param queryParameter query parameters
 * @returns url with path and query parameters
 */
export function buildUrl(path: string, queryParameter: QueryParameter[] = []): URL {
  const baseUrl = SERVER_HTTP_URL.endsWith("/") ? SERVER_HTTP_URL : SERVER_HTTP_URL + "/";
  try {
    const url = new URL(path, baseUrl);

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
  } catch (error) {
    throw new Error(`failed to build url`, {cause: error});
  }
}
