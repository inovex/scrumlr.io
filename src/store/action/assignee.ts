export const AssigneeAction = {
  AddAssignee: "scrumlr.io/addAssignee" as const,
  RemoveAssignee: "scrumlr.io/removeAssignee" as const,
};

export const AssigneeActionFactory = {
  addAssignee: (assignee: string) => ({
    type: AssigneeAction.AddAssignee,
    assignee,
  }),
  removeAssignee: (assignee: string) => ({
    type: AssigneeAction.RemoveAssignee,
    assignee,
  }),
};

export type AssigneeReduxAction = ReturnType<typeof AssigneeActionFactory.addAssignee> | ReturnType<typeof AssigneeActionFactory.removeAssignee>;
