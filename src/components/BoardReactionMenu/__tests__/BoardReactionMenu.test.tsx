import {BoardReactionMenu} from "../BoardReactionMenu";
import {render} from "testUtils";
import {fireEvent} from "@testing-library/react";

describe("board reaction menu", () => {
  it("should render correctly", () => {
    const mockClose = jest.fn();
    const boardReactionMenu = render(<BoardReactionMenu showMenu={true} close={mockClose} />);
    expect(boardReactionMenu.container).toMatchSnapshot();
  });

  it("should close on clicking close button", () => {
    const mockClose = jest.fn();
    const boardReactionMenu = render(<BoardReactionMenu showMenu={true} close={mockClose} />);
    fireEvent.click(boardReactionMenu.container.getElementsByClassName("board-reactions-menu__close")[0]);
    expect(mockClose).toHaveBeenCalled();
  });
});
