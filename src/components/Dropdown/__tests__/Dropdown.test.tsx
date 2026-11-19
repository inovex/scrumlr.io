import {fireEvent, screen} from "@testing-library/react";
import {useState} from "react";
import {Dropdown} from "components/Dropdown/Dropdown";
import {render} from "testUtils";

const DropdownHarness = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dropdown
      open={open}
      options={[
        {key: "first", label: "First", icon: null},
        {key: "second", label: "Second", icon: null},
        {key: "third", label: "Third", icon: null},
      ]}
      activeKey="first"
      onToggleMenu={() => setOpen((isOpen) => !isOpen)}
      onSelect={vi.fn()}
    />
  );
};

describe("Dropdown", () => {
  it("opens and focuses the first option with ArrowDown", () => {
    render(<DropdownHarness />);

    fireEvent.keyDown(screen.getByRole("button", {name: "First"}), {key: "ArrowDown"});

    expect(screen.getByRole("menuitem", {name: "Second"})).toHaveFocus();
  });

  it("wraps option focus with arrow keys and returns focus to the trigger on Escape", () => {
    render(<DropdownHarness />);

    fireEvent.keyDown(screen.getByRole("button", {name: "First"}), {key: "ArrowDown"});
    fireEvent.keyDown(screen.getByRole("menuitem", {name: "Second"}), {key: "ArrowUp"});

    const lastOption = screen.getByRole("menuitem", {name: "Third"});
    expect(lastOption).toHaveFocus();

    fireEvent.keyDown(lastOption, {key: "Escape"});

    expect(screen.getByRole("button", {name: "First"})).toHaveFocus();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
