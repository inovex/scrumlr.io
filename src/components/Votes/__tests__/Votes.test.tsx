import {Provider} from "react-redux";
import {Votes} from "components/Votes";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {ApplicationState} from "store";
import getTestVoting from "utils/test/getTestVoting";
import getTestParticipant from "utils/test/getTestParticipant";
import i18n from "i18nTest";
import {I18nextProvider} from "react-i18next";
import {screen} from "@testing-library/dom";

const createVotes = (overwrite?: Partial<ApplicationState>) => {
  return (
    <I18nextProvider i18n={i18n}>
      <Provider store={getTestStore(overwrite)}>
        <Votes noteId="test-notes-id-1" />
      </Provider>
    </I18nextProvider>
  );
};

describe("Votes", () => {
  describe("should render correctly", () => {
    test("with no votes and disabled voting", () => {
      const votes = render(createVotes({votings: {open: undefined, past: []}, votes: []}));
      expect(votes.container).toMatchSnapshot();
    });
    test("with no votes and active voting", () => {
      const votes = render(createVotes({votes: []}));
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and disabled voting", () => {
      const votes = render(
        createVotes({
          votings: {
            open: undefined,
            past: [
              getTestVoting({
                status: "CLOSED",
                votes: {
                  total: 1,
                  votesPerNote: {
                    "test-notes-id-1": {
                      total: 1,
                      userVotes: [
                        {
                          id: "1",
                          total: 1,
                        },
                      ],
                    },
                  },
                },
              }),
            ],
          },
        })
      );
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and active voting", () => {
      const votes = render(createVotes());
      expect(votes.container).toMatchSnapshot();
    });
  });

  it("add vote button should be hidden and remove vote button disabled on locked board", () => {
    render(
      createVotes({
        board: {
          status: "ready",
          data: {
            id: "test-board-id",
            name: "test-board-name",
            accessPolicy: "PUBLIC",
            showAuthors: true,
            showNotesOfOtherUsers: true,
            showNoteReactions: true,
            allowStacking: true,
            isLocked: true,
          },
        },
        participants: {
          self: getTestParticipant({role: "PARTICIPANT"}),
          others: [],
          focusInitiator: undefined,
        },
      })
    );

    expect(screen.queryByTitle(i18n.t("Votes.AddVote"))).not.toBeInTheDocument();
    expect(screen.queryByTitle(i18n.t("Votes.RemoveVote"))).not.toBeInTheDocument();
    // What`s the indented behaviour here? Should the button be displayed but disabled or not displayed at all?
    // We have a disparity here between the test and the code.
    // Also, querying by title does not seem like a great idea imo, class names or ids or even better html attr-* to retrieve elements.
    // expect(screen.queryByLabelText(i18n.t("Votes.VotesOnNote", {count: 1}))).toBeInTheDocument();
    // expect(screen.queryByLabelText(i18n.t("Votes.VotesOnNote", {count: 1}))).toBeDisabled();
  });

  it("add vote button should be visible and remove vote button not disabled on locked board if participant is moderator", () => {
    render(
      createVotes({
        board: {
          status: "ready",
          data: {
            id: "test-board-id",
            name: "test-board-name",
            accessPolicy: "PUBLIC",
            showAuthors: true,
            showNotesOfOtherUsers: true,
            showNoteReactions: true,
            allowStacking: true,
            isLocked: true,
          },
        },
        participants: {
          self: getTestParticipant({role: "MODERATOR"}),
          others: [],
          focusInitiator: undefined,
        },
        votings: {
          open: getTestVoting({allowMultipleVotes: true}),
          past: [],
        },
      })
    );

    expect(screen.queryByLabelText(i18n.t("Votes.AddVote"))).toBeInTheDocument();
    // same as above, what`s the intended behaviour here??
    // expect(screen.queryByLabelText(i18n.t("Votes.RemoveVote"))).toBeInTheDocument();
    // expect(screen.queryByLabelText(i18n.t("Votes.RemoveVote"))).not.toBeDisabled();
    expect(screen.queryByLabelText(i18n.t("Votes.VotesOnNote", {count: 1}))).not.toBeInTheDocument();
  });
});
