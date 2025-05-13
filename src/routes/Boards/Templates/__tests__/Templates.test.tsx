import {renderWithContext} from "testUtils";
import {Templates} from "routes/Boards/Templates/Templates";

const contextData = {searchBarInput: "test1"};

const renderTemplates = () => renderWithContext(<Templates />, contextData);

describe("Templates", () => {
  it("should render correctly", () => {
    const {container} = renderTemplates();
    expect(container).toMatchSnapshot();
  });
});
