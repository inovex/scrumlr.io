import {callAPI} from "./callApi";

export const UserAPI = {
  changePermission: (userId: string, boardId: string, moderator: boolean) => callAPI("changePermission", {userId, boardId, moderator}),
};
