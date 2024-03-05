import {render} from "testUtils";
import {fireEvent} from "@testing-library/react";
import {Dialog} from "..";

describe("Dialog", () => {
  beforeEach(() => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
  });

  it("should match snapshot", () => {
    const {container} = render(<Dialog title="Test-Dialog" />, {container: global.document.querySelector("#portal")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should contain the title prop as heading", () => {
    const {container} = render(<Dialog title="Test-Dialog" />, {container: global.document.querySelector("#portal")!});
    expect(container.getElementsByClassName("dialog__header-text")[0].innerHTML).toBe("Test-Dialog");
  });

  it("should contain the children", () => {
    const {container} = render(
      <Dialog title="Test-Dialog">
        <div className="test-child" />
      </Dialog>,
      {container: global.document.querySelector("#portal")!}
    );
    expect(container.getElementsByClassName("test-child")).toHaveLength(1);
  });

  it("should run the onClose function on ESC key press", () => {
    const mockOnClose = jest.fn();
    const {container} = render(<Dialog title="Test-Dialog" onClose={mockOnClose} />, {container: global.document.querySelector("#portal")!});
    fireEvent.keyDown(container, {key: "Escape", code: "Escape", charCode: 27});
    expect(mockOnClose).toHaveBeenCalled();
  });
});
