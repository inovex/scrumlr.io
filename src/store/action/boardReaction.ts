import {BoardReactionType, ReactionType} from "types/reaction";

export const BoardReactionAction = {
  AddBoardReaction: "scrumlr.io/addBoardReaction" as const,
  AddedBoardReaction: "scrumlr.io/addedBoardReaction" as const,
  RemoveBoardReaction: "scrumlr.io/removeBoardReaction" as const,
};

export const BoardReactionActionFactory = {
  // dispatched by client to notify server to add a board reaction
  addBoardReaction: (reactionType: ReactionType) => ({
    type: BoardReactionAction.AddBoardReaction,
    reactionType,
  }),

  // dispatched when a board reaction is added
  addedBoardReaction: (boardReaction: BoardReactionType) => ({
    type: BoardReactionAction.AddedBoardReaction,
    boardReaction,
  }),

  // dispatched by client when a board reaction is removed
  removeBoardReaction: (id: string) => ({
    type: BoardReactionAction.RemoveBoardReaction,
    id,
  }),
};

export type BoardReactionReduxAction =
  | ReturnType<typeof BoardReactionActionFactory.addBoardReaction>
  | ReturnType<typeof BoardReactionActionFactory.addedBoardReaction>
  | ReturnType<typeof BoardReactionActionFactory.removeBoardReaction>;
