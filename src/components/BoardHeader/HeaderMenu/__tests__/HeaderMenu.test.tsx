import {fireEvent, render, waitFor} from "@testing-library/react";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import store from "store";
import {ActionFactory} from "store/action";
import {exportAsJSON, exportAsCSV} from "utils/export";
import Parse, {User} from "parse";
import {screen} from "@testing-library/dom";
import {HeaderMenu} from "components/BoardHeader/HeaderMenu";
import {mocked} from "ts-jest/utils";

const mockStore = configureStore();
const mockedUser = mocked(User, true);
mockedUser.current = jest.fn(() => ({id: "test"} as never));

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
  const store = mockStore(initialState);
  const [HeaderMenuContext] = wrapWithTestBackend(HeaderMenu);
  return (
    <Provider store={store}>
      <HeaderMenuContext open onClose={() => undefined} currentUserIsModerator={currentUserIsModerator} />
    </Provider>
  );
};

describe("HeaderMenu", () => {
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

    test("count of menu items for basic users", () => {
      const {container} = render(createHeaderMenu(false), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".header-menu")?.children.length).toEqual(2);
    });

    test("tests count of menu items for moderators", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".header-menu")?.children.length).toEqual(7);
    });

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

    test("Click on share board", async () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(screen.getByTestId("qrcode")).not.toBeNull();

      const button = screen.getByTestId("qrcode")!.querySelector("button")!;
      expect(button).toHaveClass("board-option-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(container.querySelector(".share-qr-code-option__container")).toHaveClass("share-qr-code-option__container--visible");
      });
    });

    test("Click on delete board", async () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(screen.getByTestId("delete")).not.toBeNull();

      const button = screen.getByTestId("delete")!.querySelector("button")!;
      expect(button).toHaveClass("board-option-button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(container.querySelector(".delete-board-option__container")).toHaveClass("delete-board-option__container--visible");
      });
    });

    test("Click on export board", async () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(screen.getByTestId("export")).not.toBeNull();

      const button = screen.getByTestId("export")!.querySelector("button")!;
      expect(button).toHaveClass("board-option-button");
      fireEvent.click(button);
      await waitFor(() => {
        expect(container.querySelector(".export-board-option__container")).toHaveClass("export-board-option__container--visible");
      });
    });
  });

  describe("blob download", () => {
    test("json function called", async () => {
      render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(screen.getByTestId("export-json")).not.toBeNull();

      const button = screen.getByTestId("export-json")!;
      fireEvent.click(button);

      await waitFor(() => {
        expect(exportAsJSON).toBeCalled();
      });
    });

    test("csv (zip) function called", async () => {
      render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(screen.getByTestId("export-csv")).not.toBeNull();

      const button = screen.getByTestId("export-csv")!;
      fireEvent.click(button);

      await waitFor(() => {
        expect(exportAsCSV).toBeCalled();
      });
    });
  });
});
