import {render, fireEvent} from "@testing-library/react";
import {ToggleButton} from "./ToggleButton";

describe("ToggleButton", () => {
  const createToggleButton = (props: {className?: string; disabled?: boolean; onClick?: (value: string) => void}) => (
    <ToggleButton values={["value1", "value2"]} defaultValue="value1" className={props.className} disabled={props.disabled} onClick={props.onClick} />
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
    const onClickMock = jest.fn();
    const {container} = render(createToggleButton({onClick: onClickMock}));
    fireEvent.click(container.firstChild!);
    expect(onClickMock).toHaveBeenCalled();
  });

  test("should toggle between values on component click", () => {
    const onClickMock = jest.fn();
    const {container} = render(createToggleButton({onClick: onClickMock}));
    fireEvent.click(container.firstChild!);
    expect(onClickMock).toHaveBeenCalledWith("value2");
    fireEvent.click(container.firstChild!);
    expect(onClickMock).toHaveBeenCalledWith("value1");
  });
});
