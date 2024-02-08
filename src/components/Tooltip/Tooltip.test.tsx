import {fireEvent, screen, render} from "@testing-library/react";
import {Tooltip} from ".";

describe("Tooltip", () => {
  it("should not be visible with no interaction on the anchor element", () => {
    const {queryByText} = render(
      <>
        <button id="test-button">Test Button</button>
        <Tooltip anchorSelect="#test-button" content="Hello world" />
      </>
    );
    expect(queryByText("Hello world")).toBeNull();
  });

  it("should be visible on mouseenter", async () => {
    render(
      <div>
        <button id="test-button">Test Button</button>
        <Tooltip anchorSelect="#test-button" content="Hello world" />
      </div>
    );
    const button = screen.getByText("Test Button");
    fireEvent.mouseEnter(button);
    expect(await screen.findByText("Hello world")).toBeInTheDocument();
  });

  it("should be visible on focus", async () => {
    render(
      <>
        <button id="test-button">Test Button</button>
        <Tooltip anchorSelect="#test-button" content="Hello world" />
      </>
    );
    const button = screen.getByText("Test Button");
    fireEvent.focus(button);
    expect(await screen.findByText("Hello world")).toBeInTheDocument();
  });
});
