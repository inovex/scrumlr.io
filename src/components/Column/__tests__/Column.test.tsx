import {render} from "@testing-library/react";
import Column from "../Column";

const createColumn = () => <Column id="TestID" name="Testheader" color="planning-pink" />;

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
      expect(container.querySelector(".column__header-title")!.lastChild).toHaveClass("column__header-card-number");
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
});
