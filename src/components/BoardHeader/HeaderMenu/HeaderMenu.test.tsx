import {fireEvent, render} from "@testing-library/react";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import store from "store";
import {ActionFactory} from "store/action";
import {exportAsJSON, exportAsCSV, exportAsCSVZip} from "utils/export";
import Parse from "parse";
import {HeaderMenu} from "./HeaderMenu";

const mockStore = configureStore();

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
    // @ts-ignore
    Parse.User.current = jest.fn(() => ({id: "test"}));
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

    test("Header menu has 7 entries", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".header-menu")?.children.length).toEqual(3);
    });

    test("HeaderMenu for moderators has 5 entries", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".header-menu-moderator")?.children.length).toEqual(5);
    });

    test("Click on hide authors", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector("#author")).not.toBeNull();

      const button = container.querySelector("#author")?.querySelector("button")!;
      expect(button).toHaveClass("menu__item-button");
      fireEvent.click(button);
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.editBoard({id: "boardId", showAuthors: false}));
    });

    test("Click on hide notes", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector("#note")).not.toBeNull();

      const button = container.querySelector("#note")?.querySelector("button")!;
      expect(button).toHaveClass("menu__item-button");
      fireEvent.click(button);
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.editBoard({id: "boardId", showNotesOfOtherUsers: true}));
    });

    test("Click on share board", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector("#qrcode")).not.toBeNull();

      const button = container.querySelector("#qrcode")?.querySelector("button")!;
      expect(button).toHaveClass("menu__item-button");
      fireEvent.click(button);
      expect(container.querySelector(".header-menu__qrcode-container")).toHaveClass("header-menu__qrcode-container--visible");
    });

    test("Click on delete board", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector("#delete")).not.toBeNull();

      const button = container.querySelector("#delete")?.querySelector("button")!;
      expect(button).toHaveClass("menu__item-button");
      fireEvent.click(button);
      expect(container.querySelector(".header-menu__delete-container")).toHaveClass("header-menu__delete-container--visible");
    });

    test("Click on export board", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector("#export")).not.toBeNull();

      const button = container.querySelector("#export")?.querySelector("button")!;
      expect(button).toHaveClass("menu__item-button");
      fireEvent.click(button);
      expect(container.querySelector(".header-menu__export-container")).toHaveClass("header-menu__export-container--visible");
    });
  });

  describe("blob download", () => {
    test("json function called", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector("#export-json")).not.toBeNull();

      const button = container.querySelector("#export-json")!;
      fireEvent.click(button);
      expect(exportAsJSON).toBeCalled();
    });

    test("csv (zip) function called", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector("#export-csv")).not.toBeNull();

      const button = container.querySelector("#export-csv")!;
      fireEvent.click(button);
      try {
        expect(exportAsCSV).toBeCalled();
      } catch (error) {
        expect(exportAsCSVZip).toBeCalled();
      }
    });
  });
});
