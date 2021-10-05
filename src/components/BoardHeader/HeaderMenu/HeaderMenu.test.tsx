import {fireEvent, render} from "@testing-library/react";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import store from "store";
import {ActionFactory} from "store/action";
import {exportAsJSON, exportAsCSV, exportAsCSVZip} from "utils/export";
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
    },
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

    test("Click on hide authors", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      const button = container.querySelector(".header-menu")?.children.item(1)?.firstChild?.firstChild?.firstChild!;
      expect(button).toHaveClass("menu__item-button");
      fireEvent.click(button);
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.editBoard({id: "boardId", showAuthors: false}));
    });

    test("Click on hide notes", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      const button = container.querySelector(".header-menu")?.children.item(1)?.children.item(1)?.firstChild?.firstChild!;
      expect(button).toHaveClass("menu__item-button");
      fireEvent.click(button);
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.editBoard({id: "boardId", showNotesOfOtherUsers: true}));
    });

    test("Click on share board", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      const button = container.querySelector(".header-menu")?.children.item(1)?.children.item(2)?.firstChild?.firstChild!;
      expect(button).toHaveClass("menu__item-button");
      fireEvent.click(button);
      expect(container.querySelector(".header-menu__qrcode-container")).toHaveClass("header-menu__qrcode-container--visible");
    });

    test("Click on delete board", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      const button = container.querySelector(".header-menu")?.children.item(1)?.children.item(3)?.firstChild?.firstChild!;
      expect(button).toHaveClass("menu__item-button");
      fireEvent.click(button);
      expect(container.querySelector(".header-menu__delete-container")).toHaveClass("header-menu__delete-container--visible");
    });

    test("Click on export board", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      const button = container.querySelector(".header-menu")?.lastChild?.firstChild?.firstChild!;
      expect(button).toHaveClass("menu__item-button");
      fireEvent.click(button);
      expect(container.querySelector(".header-menu__export-container")).toHaveClass("header-menu__export-container--visible");
    });
  });

  describe("blob download", () => {
    test("json function called", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      const button = container.querySelector(".header-menu")?.lastChild?.firstChild?.firstChild!;
      expect(button).toHaveClass("menu__item-button");
      fireEvent.click(button);
      fireEvent.click(container.querySelector(".header-menu__export-container")?.firstChild!);
      expect(exportAsJSON).toBeCalled();
    });

    test("csv (zip) function called", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      const button = container.querySelector(".header-menu")?.lastChild?.firstChild?.firstChild!;
      expect(button).toHaveClass("menu__item-button");
      fireEvent.click(button);
      fireEvent.click(container.querySelector(".header-menu__export-container")?.lastChild!);
      try {
        expect(exportAsCSV).toBeCalled();
      } catch (error) {
        expect(exportAsCSVZip).toBeCalled();
      }
    });
  });
});
