import {Assign} from "types/assign";

export const AssignAction = {
  AddAssignee: "scrumlr.io/addAssignee" as const,
  RemoveAssignee: "scrumlr.io/removeAssignee" as const,
  AssignedUser: "scrumlr.io/assignedUser" as const,
  UnassignedUser: "scrumlr.io/unassignedUser" as const,
};

export const AssignActionFactory = {
  addAssignee: (note: string, name: string, id?: string) => ({
    type: AssignAction.AddAssignee,
    note,
    name,
    id: id || "",
  }),
  removeAssignee: (note: string, name: string, id?: string) => ({
    type: AssignAction.RemoveAssignee,
    note,
    name,
    id: id || "",
  }),
  assignedUser: (assigned: Assign) => ({
    type: AssignAction.AssignedUser,
    assigned,
  }),
  unassignedUser: (assigned: Assign) => ({
    type: AssignAction.UnassignedUser,
    assigned,
  }),
};

export type AssignReduxAction = ReturnType<typeof AssignActionFactory.addAssignee> | ReturnType<typeof AssignActionFactory.removeAssignee>;
