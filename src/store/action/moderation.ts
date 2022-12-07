// This object lists moderation specific redux action types
export const ModerationAction = {
  JoinModeration: "scrumlr.io/joinModeration" as const,
};

// Factory or creator class of internal redux moderation specific actions
export const ModerationActionFactory = {
  joinModeration: (boardId: string) => ({
    type: ModerationAction.JoinModeration,
    boardId,
  }),
};

export type ModerationReduxAction = ReturnType<typeof ModerationActionFactory.joinModeration>;
