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

  it("should be visible on mouseenter using props", async () => {
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

  it("should be visible on focus using props", async () => {
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

  it("should be visible on mouseenter using data attributes", async () => {
    render(
      <div>
        <button data-tooltip-id="test-tooltip" data-tooltip-content="Hello world">
          Test Button
        </button>
        <Tooltip id="test-tooltip" />
      </div>
    );
    const button = screen.getByText("Test Button");
    fireEvent.mouseEnter(button);
    expect(await screen.findByText("Hello world")).toBeInTheDocument();
  });

  it("should be visible on focus using data attributes", async () => {
    render(
      <>
        <button data-tooltip-id="test-tooltip" data-tooltip-content="Hello world">
          Test Button
        </button>
        <Tooltip id="test-tooltip" />
      </>
    );
    const button = screen.getByText("Test Button");
    fireEvent.focus(button);
    expect(await screen.findByText("Hello world")).toBeInTheDocument();
  });
});
