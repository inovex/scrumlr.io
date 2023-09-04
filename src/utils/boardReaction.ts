import {BoardReactionType} from "types/reaction";

// these are custom events that are can be emitted and subscribed to.
// using redux is overkill, so we decided to separate the logic, similar to toasts
export const ADD_BOARD_REACTION = "scrumlr.io/addBoardReaction";
export const REMOVE_BOARD_REACTION = "scrumlr.io/removeBoardReaction";

const add = (reaction: BoardReactionType) => {
  const addBoardReactionEvent = new CustomEvent<BoardReactionType>(ADD_BOARD_REACTION, {detail: reaction});
  document.dispatchEvent(addBoardReactionEvent);
};

const remove = (id: string) => {
  const removeBoardReactionEvent = new CustomEvent<string>(REMOVE_BOARD_REACTION, {detail: id});
  document.dispatchEvent(removeBoardReactionEvent);
};

export const BoardReactionEmitter = {
  add,
  remove,
};
