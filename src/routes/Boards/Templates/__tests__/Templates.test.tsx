import {renderWithContext} from "testUtils";
import {Templates} from "routes/Boards/Templates/Templates";
import {API} from "api";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {mergeTemplateAndColumns} from "components/ColumnsConfigurator/ColumnsConfigurator.utils";

const contextData = {searchBarInput: "test1"};

const {templates: templatesPreloaded, templatesColumns: templatesColumnsPreloaded} = getTestApplicationState();
const mockedTemplateWithColumns = mergeTemplateAndColumns(templatesPreloaded, templatesColumnsPreloaded);

const renderTemplates = () => renderWithContext(<Templates />, contextData);

jest.mock("api", () => ({API: {getTemplates: jest.fn()}}));

// thunks are currently not supported within our test utils.
// wait for https://github.com/inovex/scrumlr.io/issues/5079
describe.skip("Templates", () => {
  beforeEach(() => {
    (API.getTemplates as jest.Mock).mockImplementation(() => Promise.resolve(mockedTemplateWithColumns));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    const {container} = renderTemplates();
    expect(container).toMatchSnapshot();
  });
});
