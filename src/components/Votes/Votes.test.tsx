import {render} from "@testing-library/react";
import {Votes} from "./Votes";

describe("Votes", () => {
  describe("should render correctly", () => {
    test("with no votes and disabled voting", () => {
      const votes = render(<Votes noteId="test-id" numberOfVotes={0} activeVoting={false} />);
      expect(votes.container).toMatchSnapshot();
    });
    test("with no votes and active voting", () => {
      const votes = render(<Votes noteId="test-id" numberOfVotes={0} activeVoting />);
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and disabled voting", () => {
      const votes = render(<Votes noteId="test-id" numberOfVotes={10} activeVoting={false} />);
      expect(votes.container).toMatchSnapshot();
    });
    test("with votes and active voting", () => {
      const votes = render(<Votes noteId="test-id" numberOfVotes={10} activeVoting />);
      expect(votes.container).toMatchSnapshot();
    });
    test("with additional classname", () => {
      const votes = render(<Votes className="test-classname" noteId="test-id" numberOfVotes={0} activeVoting={false} />);
      expect(votes.container).toMatchSnapshot();
    });
  });
});
