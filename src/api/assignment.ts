import {SERVER_HTTP_URL} from "../config";

export const AssignmentAPI = {
  createAssignment: async (boardId: string, noteId: string, name: string) => {
    try {
      const response = await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/assignments`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          note: noteId,
          name,
        }),
      });

      if (response.status === 201) {
        return;
      }

      throw new Error(`add assignee request resulted in status ${response.status}`);
    } catch (error) {
      throw new Error(`unable to create board: ${error}`);
    }
  },
  deleteAssignment: async (boardId: string, assignmentId: string) => {
    try {
      await fetch(`${SERVER_HTTP_URL}/boards/${boardId}/assignments/${assignmentId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      throw new Error(`unable to delete assignment: ${error}`);
    }
  },
};
