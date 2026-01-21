import {render} from "testUtils";
import {AddTemplateColumn} from "../AddTemplateColumn";
import {AddTemplateColumnAlignment} from "components/ColumnsConfigurator/ColumnsConfigurator.types";
import {Color} from "constants/colors";
import {fireEvent} from "@testing-library/react";
import {vi} from "vitest";

const renderAddTemplateColumn = (alignment: AddTemplateColumnAlignment, color: Color, disabled: boolean, onClick: (alignment: AddTemplateColumnAlignment, color: Color) => void) =>
  render(<AddTemplateColumn alignment={alignment} color={color} disabled={disabled} onClick={onClick} />);

describe("AddTemplateColumn", () => {
  it("should render correctly", () => {
    const {container} = renderAddTemplateColumn("left", "backlog-blue", false, vi.fn());
    expect(container).toMatchSnapshot();
  });

  it("should have no right border with left alignment", () => {
    const {container} = renderAddTemplateColumn("left", "backlog-blue", false, vi.fn());
    expect(container).toHaveStyle({"border-right": "none"});
  });

  it("should have no left border with right alignment", () => {
    const {container} = renderAddTemplateColumn("right", "backlog-blue", false, vi.fn());
    expect(container).toHaveStyle({"border-left": "none"});
  });

  it("should fire onClick fn parametrized with its alignment and color", () => {
    const alignment: AddTemplateColumnAlignment = "left";
    const color: Color = "poker-purple";
    const spy = vi.fn<(alignment: AddTemplateColumnAlignment, color: Color) => void>();

    const {container} = renderAddTemplateColumn(alignment, color, false, spy);
    const addTemplateColumnButton = container.getElementsByClassName("add-template-column__button")[0];

    fireEvent.click(addTemplateColumnButton);
    expect(spy).toHaveBeenCalledWith(alignment, color);
  });

  it("should not fire onClick if disabled", () => {
    const spy = vi.fn();

    const {container} = renderAddTemplateColumn("right", "backlog-blue", true, spy);
    const addTemplateColumnButton = container.getElementsByClassName("add-template-column__button")[0];

    fireEvent.click(addTemplateColumnButton);
    expect(spy).not.toHaveBeenCalled();
  });
});
