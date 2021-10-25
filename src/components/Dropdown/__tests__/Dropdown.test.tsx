import {render, fireEvent} from "@testing-library/react";
import Dropdown from "components/Dropdown";

describe("Dropdown", () => {
  const onClickMock = jest.fn();

  const dropdownComponent = (
    <Dropdown>
      <Dropdown.Main>
        <Dropdown.Item>Item</Dropdown.Item>
        <Dropdown.ItemButton onClick={onClickMock}>Item Button</Dropdown.ItemButton>
      </Dropdown.Main>
      <Dropdown.Footer>
        <Dropdown.Item>Item</Dropdown.Item>
      </Dropdown.Footer>
    </Dropdown>
  );

  test("should render correctly", () => {
    const {container} = render(dropdownComponent);
    expect(container.firstChild).toMatchSnapshot();
  });

  test("item button should call callback on click event", () => {
    const {container} = render(dropdownComponent);
    const itemButton = container.getElementsByTagName("button")[0];
    fireEvent.click(itemButton);
    expect(onClickMock).toHaveBeenCalled();
  });
});
