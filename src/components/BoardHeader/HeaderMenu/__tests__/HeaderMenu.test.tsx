import {fireEvent, waitFor} from "@testing-library/react";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import store from "store";
import {ActionFactory} from "store/action";
import {exportAsJSON, exportAsCSV} from "utils/export";
import {User} from "parse";
import {screen} from "@testing-library/dom";
import {HeaderMenu} from "components/BoardHeader/HeaderMenu";
import {mocked} from "ts-jest/utils";
import {render} from "testUtils";

const mockStore = configureStore();
const mockedUser = mocked(User, true);
mockedUser.current = jest.fn(() => ({id: "test"} as never));

Object.assign(navigator, {
  clipboard: {
    writeText: () => {},
  },
});

jest.mock("store", () => ({
  ...jest.requireActual("store"),
  dispatch: jest.fn(),
}));

jest.mock("utils/export", () => ({
  ...jest.requireActual("utils/export"),
  exportAsJSON: jest.fn(),
  exportAsCSV: jest.fn(),
  exportAsCSVZip: jest.fn(),
}));

jest.mock("file-saver", () => ({saveAs: jest.fn()}));

const initialState = {
  board: {
    data: {
      name: "board",
      showAuthors: true,
      joinConfirmationRequired: true,
      id: "boardId",
      userConfigurations: [
        {
          id: "test",
          showHiddenColumns: true,
        },
      ],
    },
  },
  users: {
    all: [
      {
        id: "test",
        displayName: "John Doe",
        admin: false,
        updatedAt: new Date("2020-11-30"),
        createdAt: new Date("2020-11-30"),
        online: false,
      },
    ],
  },
};

const createHeaderMenu = (currentUserIsModerator: boolean) => {
  const mockedStore = mockStore(initialState);
  const [HeaderMenuContext] = wrapWithTestBackend(HeaderMenu);
  return (
    <Provider store={mockedStore}>
      <HeaderMenuContext open onClose={() => undefined} currentUserIsModerator={currentUserIsModerator} />
    </Provider>
  );
};

describe("<HeaderMenu/>", () => {
  beforeEach(() => {
    mockedUser.current = jest.fn(() => ({id: "test"} as never));
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
  });

  describe("should render correctly", () => {
    test("moderator", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(container).toMatchSnapshot();
    });

    test("user", () => {
      const {container} = render(createHeaderMenu(false), {container: global.document.querySelector("#portal")!});
      expect(container).toMatchSnapshot();
    });

    describe("BoardOption.ShowAuthorOption", () => {
      test("Click on hide authors", async () => {
        render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
        expect(screen.getByTestId("author")).not.toBeNull();

        const button = screen.getByTestId("author")!.querySelector("button")!;
        expect(button).toHaveClass("board-option-button");
        fireEvent.click(button);

        await waitFor(() => {
          expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.editBoard({id: "boardId", showAuthors: false}));
        });
      });

      test("Hide authors has correct label", () => {
        render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
        expect(screen.getByTestId("author")).not.toBeNull();

        const label = screen.getByTestId("author")!.querySelector("span")!;
        expect(label).toHaveClass("board-option-button__label");
        expect(label.innerHTML).toEqual("Hide authors of card");
      });
    });

    describe("BoardOption.ShowNotesOfOtherUserOption", () => {
      test("Click on hide notes", async () => {
        render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
        expect(screen.getByTestId("note")).not.toBeNull();

        const button = screen.getByTestId("note")!.querySelector("button")!;
        expect(button).toHaveClass("board-option-button");
        fireEvent.click(button);

        await waitFor(() => {
          expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.editBoard({id: "boardId", showNotesOfOtherUsers: true}));
        });
      });

      test("Hide notes has correct label", () => {
        render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
        expect(screen.getByTestId("note")).not.toBeNull();

        const label = screen.getByTestId("note")!.querySelector("span")!;
        expect(label).toHaveClass("board-option-button__label");
        expect(label.innerHTML).toEqual("Show notes of other users");
      });
    });

    describe("BoardOption.ShowHiddenColumnsOption", () => {
      test("Click on hide columns", async () => {
        render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
        expect(screen.getByTestId("column")).not.toBeNull();

        const button = screen.getByTestId("column")!.querySelector("button")!;
        expect(button).toHaveClass("board-option-button");
        fireEvent.click(button);

        await waitFor(() => {
          expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.editUserConfiguration({showHiddenColumns: false}));
        });
      });

      test("Hide columns has correct label", () => {
        render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
        expect(screen.getByTestId("column")).not.toBeNull();

        const label = screen.getByTestId("column")!.querySelector("span")!;
        expect(label).toHaveClass("board-option-button__label");
        expect(label.innerHTML).toEqual("Hide columns");
      });
    });
  });
});
