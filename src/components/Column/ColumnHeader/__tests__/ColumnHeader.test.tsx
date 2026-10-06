import {render} from "@testing-library/react";
import {ColumnHeader} from "components/Column/ColumnHeader/ColumnHeader";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";

// ColumnHeader -> NoteInput -> uses this hook too
vi.mock("utils/hooks/useImageChecker.ts", async () => ({
  useImageChecker: () => false,
}));

describe("ColumnHeader", () => {
  const renderColumnHeader = () =>
    render(
      <Provider store={getTestStore()}>
        <ColumnHeader column={getTestApplicationState().columns[0]} notesCount={1} isTemporary={false} />
      </Provider>
    );

  it("should render correctly", () => {
    const {container} = renderColumnHeader();
    expect(container).toMatchSnapshot();
  });
});
