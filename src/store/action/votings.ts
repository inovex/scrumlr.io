import {CreateVotingRequest, Voting} from "types/voting";
import {Note} from "../../types/note";

export const VotingAction = {
  CreateVoting: "scrumlr.io/createVoting" as const,
  CloseVoting: "scrumlr.io/closeVoting" as const,
  CreatedVoting: "scrumlr.io/createdVoting" as const,
  UpdatedVoting: "scrumlr.io/updatedVoting" as const,
};

export const VotingActionFactory = {
  /**
   * Creates an action which should be dispatched when the user wants to add a vote configuration.
   *
   * @param voting the current vote configuration
   */
  createVoting: (voting: CreateVotingRequest) => ({
    type: VotingAction.CreateVoting,
    voting,
  }),

  closeVoting: (voting: string) => ({
    type: VotingAction.CloseVoting,
    voting,
  }),

  /**
   * Creates an action which should be dispatched when a new vote configuration was created on the server.
   *
   * @param voting the vote configuration added on the server
   */
  createdVoting: (voting: Voting) => ({
    type: VotingAction.CreatedVoting,
    voting,
  }),
  /**
   * Creates an action which should be dispatched when a new vote configuration was removed on the server.
   *
   * @param voting the vote configuration added on the server
   */
  updatedVoting: (voting: Voting, notes: Note[] | undefined) => ({
    type: VotingAction.UpdatedVoting,
    voting,
    notes,
  }),
};

export type VotingReduxAction =
  | ReturnType<typeof VotingActionFactory.createVoting>
  | ReturnType<typeof VotingActionFactory.closeVoting>
  | ReturnType<typeof VotingActionFactory.createdVoting>
  | ReturnType<typeof VotingActionFactory.updatedVoting>;
