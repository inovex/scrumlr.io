import {wrapWithTestBackend} from "react-dnd-test-utils";
import {Column} from "components/Column";
import {render} from "testUtils";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {ApplicationState} from "types";
import getTestParticipant from "utils/test/getTestParticipant";

const [ColumnContext] = wrapWithTestBackend(Column);
const createColumn = (overwrite?: Partial<ApplicationState>) => {
  return (
    <Provider store={getTestStore(overwrite)}>
      <ColumnContext id="TestID" name="Testheader" color="planning-pink" visible={false} index={0} />
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
      const {container} = render(createColumn());
      expect(container.querySelector(".column__header-title")?.lastChild).toHaveClass("column__header-toggle");
    });

    test("Hide button should not be visible", () => {
      const {container} = render(createColumn({participants: {self: getTestParticipant({role: "PARTICIPANT"}), others: []}}));
      expect(container.querySelector(".column__header-title")?.lastChild).not.toHaveClass("column__header-toggle");
    });

    test("Snapshot: Hide button should be visible", () => {
      const {container} = render(createColumn());
      expect(container.querySelector(".column__header-title")?.lastChild).toMatchSnapshot();
    });
  });
});
