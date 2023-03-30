import {wrapWithTestBackend} from "react-dnd-test-utils";
import {Column} from "components/Column";
import {render} from "testUtils";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {ApplicationState} from "types";

const [ColumnContext] = wrapWithTestBackend(Column);
const createColumn = (overwrite?: Partial<ApplicationState>) => {
  return (
    <Provider store={getTestStore(overwrite)}>
      <ColumnContext id="test-columns-id-1" name="Testheader 1" color="planning-pink" visible={false} index={0} />
    </Provider>
  );
};

const createEmptyColumn = (overwrite?: Partial<ApplicationState>) => {
  return (
    <Provider store={getTestStore(overwrite)}>
      <ColumnContext id="test-columns-id-3" name="Testheader 1" color="planning-pink" visible={false} index={0} />
    </Provider>
  );
};

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
      expect(container.querySelector(".column__header")!.childNodes.item(1)).toHaveClass("column__header-title");
    });

    test("column header text is present", () => {
      const {container} = render(createColumn());
      expect(container.querySelector(".column__header-title")!.firstChild).toHaveClass("column__header-text-wrapper");
    });

    test("column header card number is present", () => {
      const {container} = render(createColumn());
      expect(container.querySelector(".column__header-title")!.children[1]).toHaveClass("column__header-card-number");
    });

    test("column header card number is not present", () => {
      const {container} = render(createEmptyColumn());
      expect(container.querySelector(".column__header-title")!.children[1]).not.toHaveClass("column__header-card-number");
    });

    test("column header card number is correct number", () => {
      const {container} = render(createColumn());
      expect(container.querySelector(".column__header-card-number")!).toHaveTextContent("2");
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
