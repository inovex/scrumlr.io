import {fireEvent, waitFor} from "@testing-library/react";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import {Provider} from "react-redux";
import {Actions} from "store/action";
import {screen} from "@testing-library/dom";
import {HeaderMenu} from "components/BoardHeader/HeaderMenu";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import * as redux from "react-redux";
import {Dispatch, Action} from "redux";

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

const createHeaderMenu = (currentUserIsModerator: boolean) => {
  const [HeaderMenuContext] = wrapWithTestBackend(HeaderMenu);
  return (
    <Provider store={getTestStore()}>
      <HeaderMenuContext open onClose={() => undefined} currentUserIsModerator={currentUserIsModerator} />
    </Provider>
  );
};

describe("<HeaderMenu/>", () => {
  let mockDispatchFn: jest.Mock<any, any> | Dispatch<Action<any>>;

  beforeEach(() => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
    const useDispatchSpy = jest.spyOn(redux, "useDispatch");
    mockDispatchFn = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatchFn);
  });

  describe("should render correctly", () => {
    test("for moderator", () => {
      const {container} = render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
      expect(container).toMatchSnapshot();
    });

    test("for participants", () => {
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
          expect(mockDispatchFn).toHaveBeenCalledWith(Actions.editBoard({showAuthors: false}));
        });
      });

      test("Hide authors has correct label", () => {
        render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
        expect(screen.getByTestId("author")).not.toBeNull();

        const label = screen.getByTestId("author")!.querySelector("span")!;
        expect(label).toHaveClass("board-option-button__label");
        expect(label.innerHTML).toEqual("Show authors of notes");
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
          expect(mockDispatchFn).toHaveBeenCalledWith(Actions.editBoard({showNotesOfOtherUsers: false}));
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
      test("Click on show columns", async () => {
        render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
        expect(screen.getByTestId("column")).not.toBeNull();

        const button = screen.getByTestId("column")!.querySelector("button")!;
        expect(button).toHaveClass("board-option-button");
        fireEvent.click(button);

        await waitFor(() => {
          expect(mockDispatchFn).toHaveBeenCalledWith(Actions.setShowHiddenColumns(true));
        });
      });

      test("Show columns has correct label", () => {
        render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
        expect(screen.getByTestId("column")).not.toBeNull();

        const label = screen.getByTestId("column")!.querySelector("span")!;
        expect(label).toHaveClass("board-option-button__label");
        expect(label.innerHTML).toEqual("Show hidden columns for me");
      });
    });
  });
});
