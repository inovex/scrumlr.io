import {fireEvent} from "@testing-library/react";
import {render} from "testUtils";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import {User} from "parse";
import {BoardHeader} from "components/BoardHeader/BoardHeader";
import {mocked} from "ts-jest/utils";

const mockStore = configureStore();
const mockedUser = mocked(User, true);
mockedUser.current = jest.fn(() => ({id: "test"} as never));

const createBoardHeader = (name: string, boardstatus: string) => {
  const initialState = {
    board: {
      data: {
        columns: [],
        userConfigurations: [
          {
            id: "test",
            showHiddenColumns: true,
          },
        ],
      },
    },
    notes: [],
    users: {
      admins: [],
      basic: [],
      all: [],
    },
  };
  const store = mockStore(initialState);

  return (
    <Provider store={store}>
      <BoardHeader name={name} boardstatus={boardstatus} currentUserIsModerator={false} />
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
        } as unknown as IntersectionObserver)
    );

    mockedUser.current = jest.fn(() => ({id: "test"} as never));
  });

  test("show boardheader", () => {
    const {container} = render(createBoardHeader("Title", "Private Session"));
    expect(container.firstChild).toHaveClass("board-header");
  });

  describe("show board-header-components", () => {
    test("show board-header__logo", () => {
      const {container} = render(createBoardHeader("Title", "Private Session"));
      expect(container.querySelector(".board-header__logo")).toBeDefined();
    });

    test("show board-header__infos", () => {
      const {container} = render(createBoardHeader("Title", "Private Session"));
      expect(container.querySelector(".board-header__name-and-settings")).toBeDefined();
    });

    test("show board-header__users", () => {
      const {container} = render(createBoardHeader("Title", "Private Session"));
      expect(container.querySelector(".board-header__users")).toBeDefined();
    });
  });

  describe("show title and boardstatus", () => {
    test("show title", () => {
      const {container} = render(createBoardHeader("Title", "Private Session"));
      expect(container.querySelector(".board-header__name")).toHaveTextContent("Title");
    });

    test("show boardstatus private", () => {
      const {container} = render(createBoardHeader("Title", "Private Session"));
      expect(container.querySelector(".board-header__access-policy-status")).toHaveTextContent("Private Session");
    });

    test("show boardstatus public", () => {
      const {container} = render(createBoardHeader("Title", "Public Session"));
      expect(container.querySelector(".board-header__access-policy-status")).toHaveTextContent("Public Session");
    });

    test("show confirmation-dialog after clicking Scrumlr Logo", () => {
      const {container} = render(createBoardHeader("Title", "Public Session"));
      fireEvent.click(container.querySelector(".board-header__link") as HTMLElement);
      expect(container.querySelector(".confirmation-dialog")).toBeInTheDocument();
    });
  });
});
