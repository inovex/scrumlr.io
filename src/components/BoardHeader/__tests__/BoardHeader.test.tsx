import {render} from "testUtils";
import {Provider} from "react-redux";
import {BoardHeader} from "components/BoardHeader/BoardHeader";
import getTestStore from "utils/test/getTestStore";
import {ApplicationState} from "types";

const createBoardHeader = (overwrite?: Partial<ApplicationState>) => {
  return (
    <Provider store={getTestStore(overwrite)}>
      <BoardHeader currentUserIsModerator={false} />
    </Provider>
  );
};

describe("Board Header", () => {
  beforeEach(() => {
    window.IntersectionObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        }) as unknown as IntersectionObserver
    );
  });

  test("show board-header", () => {
    const {container} = render(createBoardHeader());
    expect(container.firstChild).toHaveClass("board-header");
  });

  describe("show board-header-components", () => {
    test("show board-header__logo", () => {
      const {container} = render(createBoardHeader());
      expect(container.querySelector(".board-header__logo")).toBeDefined();
    });

    test("show board-header__name-and-settings", () => {
      const {container} = render(createBoardHeader());
      expect(container.querySelector(".board-header__name-and-settings")).toBeDefined();
    });

    test("show board-header__users", () => {
      const {container} = render(createBoardHeader());
      expect(container.querySelector(".board-header__users")).toBeDefined();
    });
  });

  describe("show title and access policy", () => {
    test("show title", () => {
      const {container} = render(createBoardHeader());
      expect(container.querySelector(".board-header__name")).toHaveTextContent("test-board-name");
    });

    test("show access policy public", () => {
      const {container} = render(createBoardHeader());
      expect(container.querySelector(".board-header__access-policy-status")?.childNodes[1]).toHaveTextContent("AccessPolicy.PUBLIC");
    });

    test("show access policy private", () => {
      const {container} = render(
        createBoardHeader({
          board: {
            status: "ready",
            data: {
              id: "test-board-id",
              name: "test-board-name",
              accessPolicy: "BY_PASSPHRASE",
              showAuthors: true,
              showNotesOfOtherUsers: true,
              allowStacking: true,
              allowEditing: true,
              showNoteReactions: true,
            },
          },
        })
      );
      expect(container.querySelector(".board-header__access-policy-status")?.childNodes[1]).toHaveTextContent("AccessPolicy.BY_PASSPHRASE");
    });
  });
});
