import {ColumnConfiguratorColumnNameDetails, ColumnConfiguratorColumnNameDetailsProps} from "../ColumnConfiguratorColumnNameDetails";
import {render} from "testUtils";

const renderColumnConfiguratorColumnNameDetails = (override: Partial<ColumnConfiguratorColumnNameDetailsProps> = {}) => {
  const defaultProps: ColumnConfiguratorColumnNameDetailsProps = {
    className: "column-configurator-column-name-details",
    name: "Default Name",
    description: "Default Description",
    openState: "closed",
    setOpenState: jest.fn(),
    updateColumnTitle: jest.fn(),
  };

  return render(<ColumnConfiguratorColumnNameDetails {...defaultProps} {...override} />);
};

describe("ColumnConfiguratorColumnNameDetails", () => {
  it("should render correctly", () => {
    const {container} = renderColumnConfiguratorColumnNameDetails();
    expect(container).toMatchSnapshot();
  });
});
