import {wrapWithTestBackend} from "react-dnd-test-utils";
import {Provider} from "react-redux";
import {screen} from "@testing-library/dom";
import {HeaderMenu} from "components/BoardHeader/HeaderMenu";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";

Object.assign(navigator, {
  clipboard: {
    writeText: () => {},
  },
});

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
  beforeEach(() => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
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
      test("Hide authors has correct label", () => {
        render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
        expect(screen.getByTestId("author")).not.toBeNull();

        const label = screen.getByTestId("author")!.querySelector("span")!;
        expect(label).toHaveClass("board-option-button__label");
        expect(label.innerHTML).toEqual("Show authors of notes");
      });
    });

    describe("BoardOption.ShowNotesOfOtherUserOption", () => {
      test("Hide notes has correct label", () => {
        render(createHeaderMenu(true), {container: global.document.querySelector("#portal")!});
        expect(screen.getByTestId("note")).not.toBeNull();

        const label = screen.getByTestId("note")!.querySelector("span")!;
        expect(label).toHaveClass("board-option-button__label");
        expect(label.innerHTML).toEqual("Show notes of other users");
      });
    });

    describe("BoardOption.ShowHiddenColumnsOption", () => {
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
