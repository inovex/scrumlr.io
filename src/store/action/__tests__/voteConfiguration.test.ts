import {AssertTypeEqual} from "testUtils";
import {VoteConfigurationClientModel} from "types/voteConfiguration";
import {ReduxAction} from "store/action";
import {VoteConfigurationActionFactory, VoteConfigurationActionType, VoteConfigurationReduxAction} from "store/action/voteConfiguration";

describe("vote comfiguration actions", () => {
  test("equal number of action types and factory functions", () => {
    expect(Object.keys(VoteConfigurationActionType).length).toEqual(Object.keys(VoteConfigurationActionFactory).length);
  });

  describe("add vote configuration", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof VoteConfigurationActionFactory.addVoteConfiguration>, VoteConfigurationReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof VoteConfigurationActionFactory.addVoteConfiguration>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = VoteConfigurationActionFactory.addVoteConfiguration({boardId: "test_board", voteLimit: 5, allowMultipleVotesPerNote: true, showVotesOfOtherUsers: true});
      expect(action).toEqual({
        type: "@@SCRUMLR/addVoteConfiguration",
        voteConfiguration: {
          boardId: "test_board",
          voteLimit: 5,
          allowMultipleVotesPerNote: true,
          showVotesOfOtherUsers: true,
        },
      });
    });
  });

  describe("remove vote configuration", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof VoteConfigurationActionFactory.removeVoteConfiguration>, VoteConfigurationReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof VoteConfigurationActionFactory.removeVoteConfiguration>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = VoteConfigurationActionFactory.removeVoteConfiguration("test_board");
      expect(action).toEqual({
        type: "@@SCRUMLR/removeVoteConfiguration",
        boardId: "test_board",
      });
    });
  });

  describe("initialize vote configuration", () => {
    test("type is listed in users redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof VoteConfigurationActionFactory.initializeVoteConfiguration>, VoteConfigurationReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("type is listed in general redux actions", () => {
      // testing type equality here will not report an error at runtime but cause problems with typescript
      const assertion: AssertTypeEqual<ReturnType<typeof VoteConfigurationActionFactory.initializeVoteConfiguration>, ReduxAction> = true;
      expect(assertion).toBe(true);
    });

    test("created action", () => {
      const action = VoteConfigurationActionFactory.initializeVoteConfiguration({
        boardId: "test_board",
        votingIteration: 1,
        voteLimit: 5,
        allowMultipleVotesPerNote: true,
        showVotesOfOtherUsers: true,
      } as unknown as VoteConfigurationClientModel);
      expect(action).toEqual({
        type: "@@SCRUMLR/initializeVoteConfiguration",
        voteConfiguration: {
          boardId: "test_board",
          votingIteration: 1,
          voteLimit: 5,
          allowMultipleVotesPerNote: true,
          showVotesOfOtherUsers: true,
        },
      });
    });
  });
});
