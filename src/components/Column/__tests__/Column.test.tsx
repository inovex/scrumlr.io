import {Column} from "components/Column";
import {render} from "testUtils";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {ApplicationState} from "store";
import {CustomDndContext} from "components/DragAndDrop/CustomDndContext";

jest.mock("utils/hooks/useImageChecker.ts", () => ({
  useImageChecker: () => false,
}));

const createColumn = (overwrite?: Partial<ApplicationState>) => {
  return (
    <Provider store={getTestStore(overwrite)}>
      <CustomDndContext>
        <Column id="test-columns-id-1" name="Testheader 1" description="" color="planning-pink" visible={false} index={0} />
      </CustomDndContext>
    </Provider>
  );
};

const createEmptyColumn = (overwrite?: Partial<ApplicationState>) => {
  return (
    <Provider store={getTestStore(overwrite)}>
      <CustomDndContext>
        <Column id="test-columns-id-3" name="Testheader 1" description="" color="planning-pink" visible={false} index={0} />
      </CustomDndContext>
    </Provider>
  );
};

describe("Column", () => {
  beforeEach(() => {
    window.ResizeObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
          unobserve: jest.fn(),
        }) as unknown as ResizeObserver
    );
  });

  describe("should render correctly", () => {
    test("column has correct accent-color", () => {
      const {container} = render(createColumn());
      expect(container).toMatchSnapshot();
    });
  });

  describe("should have correct style", () => {
    test("show column with correct style", () => {
      const {container} = render(createColumn());
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
