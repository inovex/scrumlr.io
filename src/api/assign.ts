import {Assign} from "types/assign";
import {SERVER_HTTP_URL} from "../config";

export const AssignAPI = {
  addAssignee: async (boardId: string, noteId: string, name: string, id: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/notes/${noteId}/assinging`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          note: noteId,
          name,
          id,
        }),
      });

      if (response.status === 201) {
        return (await response.json()) as Assign;
      }

      throw new Error(`add assignee request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create board: ${error}`);
    }
  },
};
