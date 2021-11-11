import {render, fireEvent} from "@testing-library/react";
import {DotButton} from "components/DotButton";

describe("DotButton", () => {
  test("should render correctly", () => {
    const dotButton = render(
      <DotButton>
        <span>test-text</span>
      </DotButton>
    );
    expect(dotButton.container).toMatchSnapshot();
  });

  test("should render correctly with additional classname", () => {
    const dotButton = render(
      <DotButton className="test-classname">
        <span>test-text</span>
      </DotButton>
    );
    expect(dotButton.container).toMatchSnapshot();
  });

  test("should call 'onClick' if given", () => {
    const mockOnClick = jest.fn();
    const dotButton = render(<DotButton onClick={mockOnClick} />);
    fireEvent.click(dotButton.container.getElementsByTagName("button")[0]);
    expect(mockOnClick).toHaveBeenCalled();
  });
});
