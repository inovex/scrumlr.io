import {Assignment} from "types/assignment";

export const AssignmentAction = {
  CreateAssignment: "scrumlr.io/createAssignment" as const,
  DeleteAssignment: "scrumlr.io/deleteAssignment" as const,

  CreatedAssignment: "scrumlr.io/createdAssignment" as const,
  DeletedAssignment: "scrumlr.io/deletedAssignment" as const,
};

export const AssignmentActionFactory = {
  createAssignment: (noteId: string, name: string) => ({
    type: AssignmentAction.CreateAssignment,
    noteId,
    name,
  }),
  deleteAssignment: (assignmentId: string) => ({
    type: AssignmentAction.DeleteAssignment,
    assignmentId,
  }),
  createdAssignment: (assignment: Assignment) => ({
    type: AssignmentAction.CreatedAssignment,
    assignment,
  }),
  deletedAssignment: (assignmentId: string) => ({
    type: AssignmentAction.DeletedAssignment,
    assignmentId,
  }),
};

export type AssignmentReduxAction =
  | ReturnType<typeof AssignmentActionFactory.createAssignment>
  | ReturnType<typeof AssignmentActionFactory.deleteAssignment>
  | ReturnType<typeof AssignmentActionFactory.createdAssignment>
  | ReturnType<typeof AssignmentActionFactory.deletedAssignment>;
