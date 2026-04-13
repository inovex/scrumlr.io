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

const NOTE_ID = "test-notes-id-1";

const createVotes = (overwrite?: Partial<ApplicationState>) => {
  return (
    <I18nextProvider i18n={i18n}>
      <Provider store={getTestStore(overwrite)}>
        <Votes noteId={NOTE_ID} />
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
    const {container} = render(
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

    const addVoteButton = container.querySelector(`#vote-button-add-${NOTE_ID}`);
    const removeVoteButton = container.querySelector(`#vote-button-remove-${NOTE_ID}`);

    expect(addVoteButton).not.toBeInTheDocument();

    expect(removeVoteButton).toBeInTheDocument();
    expect(removeVoteButton).toBeDisabled();
  });

  it("add vote button should be visible and remove vote button not disabled on locked board if participant is moderator", () => {
    const {container} = render(
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

    const addVoteButton = container.querySelector(`#vote-button-add-${NOTE_ID}`);
    const removeVoteButton = container.querySelector(`#vote-button-remove-${NOTE_ID}`);

    expect(addVoteButton).toBeInTheDocument();

    expect(removeVoteButton).toBeInTheDocument();
    expect(removeVoteButton).toBeEnabled();

    expect(screen.queryByLabelText(i18n.t("Votes.VotesOnNote", {count: 1}))).not.toBeInTheDocument();
  });
});
