import {fireEvent} from "@testing-library/react";
import {ToggleButton} from "components/ToggleButton";
import {render} from "testUtils";

describe("ToggleButton", () => {
  const createToggleButton = (props: {value?: string; className?: string; disabled?: boolean; onToggle?: (value: string) => void; onLeft?: () => void; onRight?: () => void}) => (
    <ToggleButton
      values={["value1", "value2"]}
      value={props.value ?? "value1"}
      className={props.className}
      disabled={props.disabled}
      onToggle={props.onToggle}
      onLeft={props.onLeft}
      onRight={props.onRight}
    />
  );

  test("should render correctly", () => {
    const {container} = render(createToggleButton({}));
    expect(container.firstChild).toMatchSnapshot();
  });

  test("should render correctly with disabled flag", () => {
    const {container} = render(createToggleButton({disabled: true}));
    expect(container.firstChild).toHaveAttribute("disabled");
  });

  test("should render correctly with additional classname", () => {
    const {container} = render(createToggleButton({className: "test-classname"}));
    expect(container.firstChild).toHaveClass("test-classname");
  });

  test("should call onClick on component click", () => {
    const onToggleMock = jest.fn();
    const {container} = render(createToggleButton({onToggle: onToggleMock}));
    fireEvent.click(container.firstChild!);
    expect(onToggleMock).toHaveBeenCalled();
  });

  test("should return the opposite value", () => {
    const onToggleMock = jest.fn();
    const {container} = render(createToggleButton({onToggle: onToggleMock}));
    fireEvent.click(container.firstChild!);
    expect(onToggleMock).toHaveBeenCalledWith("value2");
  });

  test("should call onLeft if toggled to the left", () => {
    const onRightMock = jest.fn();
    const {container} = render(createToggleButton({onRight: onRightMock}));
    fireEvent.click(container.firstChild!);
    expect(onRightMock).toHaveBeenCalled();
  });

  test("should call onRight if toggled to the right", () => {
    const onLeftMock = jest.fn();
    const {container} = render(createToggleButton({value: "value2", onLeft: onLeftMock}));
    fireEvent.click(container.firstChild!);
    expect(onLeftMock).toHaveBeenCalled();
  });
});
