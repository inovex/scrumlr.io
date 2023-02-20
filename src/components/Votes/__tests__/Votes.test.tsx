import {Provider} from "react-redux";
import {Votes} from "components/Votes";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {ApplicationState} from "types";
import getTestVoting from "utils/test/getTestVoting";

const createVotes = (overwrite?: Partial<ApplicationState>) => {
  return (
    <Provider store={getTestStore(overwrite)}>
      <Votes noteId="test-notes-id-1" />
    </Provider>
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
});
