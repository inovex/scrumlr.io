import {Reaction} from "../../types/reaction";

/** This object lists note object specific internal Redux Action types. */
export const ReactionAction = {
  /*
   * ATTENTION:
   * Don't forget the `as` casting for each field, because the type inference
   * won't work otherwise (e.g. in reducers).
   */
  AddReaction: "scrumlr.io/addReaction" as const,
  UpdatedReactions: "scrumlr.io/updatedReactions" as const,
  DeleteReaction: "scrumlr.io/deleteReaction" as const,
  DeletedReaction: "scrumlr.io/deletedReaction" as const,
};

/** Factory or creator class of internal Redux reaction object specific actions. */
export const ReactionActionFactory = {
  /*
   * ATTENTION:
   * Each action creator should be also listed in the type `ReactionReduxAction`, because
   * the type inference won't work otherwise (e.g. in reducers).
   */

  /**
   * Creates an action which should be dispatched when the user wants to add a reaction for the specified note.
   *
   * @param reactionId which note is being reaction to
   * @param reactionType the type of reaction
   */
  addReaction: (reactionId: string, reactionType: string) => ({
    type: ReactionAction.AddReaction,
    reactionId,
    reactionType,
  }),

  /**
   * Creates an action which should be dispatched when one or more reactions are updated (i.e. added)
   * @param reactions
   */
  updatedReaction: (reactions: Reaction[]) => ({
    type: ReactionAction.UpdatedReactions,
    reactions,
  }),

  /**
   * Creates an action which should be dispatched when a reaction should be deleted
   * @param reactionId which reaction is about to be deleted
   */
  deleteReaction: (reactionId: string) => ({
    type: ReactionAction.DeleteReaction,
    reactionId,
  }),

  /**
   * Creates an action which should be dispatched when a reaction was deleted
   * @param reactionId
   */
  deletedReaction: (reactionId: string) => ({
    type: ReactionAction.DeletedReaction,
    reactionId,
  }),
};

export type ReactionReduxAction =
  | ReturnType<typeof ReactionActionFactory.addReaction>
  | ReturnType<typeof ReactionActionFactory.updatedReaction>
  | ReturnType<typeof ReactionActionFactory.deleteReaction>
  | ReturnType<typeof ReactionActionFactory.deletedReaction>;
