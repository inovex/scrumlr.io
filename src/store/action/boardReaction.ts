import {BoardReactionType} from "types/reaction";

export const BoardReactionAction = {
  AddBoardReaction: "scrumlr.io/addBoardReaction" as const,
  RemoveBoardReaction: "scrumlr.io/removeBoardReaction" as const,
};

export const BoardReactionActionFactory = {
  addBoardReaction: (boardReaction: BoardReactionType) => ({
    type: BoardReactionAction.AddBoardReaction,
    boardReaction,
  }),

  removeBoardReaction: (id: string) => ({
    type: BoardReactionAction.RemoveBoardReaction,
    id,
  }),
};

export type BoardReactionReduxAction = ReturnType<typeof BoardReactionActionFactory.addBoardReaction> | ReturnType<typeof BoardReactionActionFactory.removeBoardReaction>;
