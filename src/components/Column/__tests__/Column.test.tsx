import {fireEvent, render} from "@testing-library/react";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import store from "store";
import {ActionFactory} from "store/action";
import Column from "../Column";

jest.mock("store", () => ({
  dispatch: jest.fn(),
}));

const [ColumnContext] = wrapWithTestBackend(Column);
const createColumn = (currentUserIsModerator = false) => (
  <ColumnContext id="TestID" name="Testheader" color="planning-pink" hidden={false} currentUserIsModerator={currentUserIsModerator} />
);

describe("Column", () => {
  describe("should render correctly", () => {
    test("column has correct accent-color", () => {
      const {container} = render(createColumn());
      expect(container.firstChild).toHaveClass("column accent-color__planning-pink");
    });

    test("column content is present", () => {
      const {container} = render(createColumn());
      expect(container.querySelector(".column")!.firstChild).toHaveClass("column__content");
    });

    test("column header is present", () => {
      const {container} = render(createColumn());
      expect(container.querySelector(".column__content")!.firstChild).toHaveClass("column__header");
    });

    test("column header title is present", () => {
      const {container} = render(createColumn());
      expect(container.querySelector(".column__header")!.firstChild).toHaveClass("column__header-title");
    });

    test("column header text is present", () => {
      const {container} = render(createColumn());
      expect(container.querySelector(".column__header-title")!.firstChild).toHaveClass("column__header-text");
    });

    test("column header cardnumber is present", () => {
      const {container} = render(createColumn());
      expect(container.querySelector(".column__header-title")!.children[1]).toHaveClass("column__header-card-number");
    });

    test("header text has correct title", () => {
      const {container} = render(createColumn());
      expect(container.firstChild).toHaveTextContent("Testheader");
    });
  });

  describe("should have correct style", () => {
    test("show column with correct style", () => {
      const {container} = render(createColumn());
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("Test behavior of hidden columns", () => {
    test("Hide button should be visible", () => {
      const {container} = render(createColumn(true));
      expect(container.querySelector(".column__header-title")?.lastChild).toHaveClass("column__header-toggle");
    });

    test("Hide button should not be visible", () => {
      const {container} = render(createColumn(false));
      expect(container.querySelector(".column__header-title")?.lastChild).not.toHaveClass("column__header-toggle");
    });

    test("Snapshot: Hide button should be visible", () => {
      const {container} = render(createColumn(true));
      expect(container.querySelector(".column__header-title")?.lastChild).toMatchSnapshot();
    });

    test("Hide button clicked", () => {
      const {container} = render(createColumn(true));
      fireEvent.click(container.querySelector(".column__header-toggle")?.firstChild!);
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.editColumn({columnId: "TestID", hidden: true}));
    });
  });
});
