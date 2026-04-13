import {fireEvent, screen, render} from "@testing-library/react";
import {Tooltip} from ".";

describe("Tooltip", () => {
  it("should not be visible with no interaction on the anchor element", () => {
    const {queryByText} = render(
      <>
        <button id="test-button">Test Button</button>
        <Tooltip anchorId="test-button">Hello world</Tooltip>
      </>
    );
    expect(queryByText("Hello world")).toBeNull();
  });

  it("should be visible on mouseenter using props", async () => {
    render(
      <div>
        <button id="test-button">Test Button</button>
        <Tooltip anchorId="test-button">Hello world</Tooltip>
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
        <Tooltip anchorId="test-button">Hello world</Tooltip>
      </>
    );
    const button = screen.getByText("Test Button");
    fireEvent.focus(button);
    expect(await screen.findByText("Hello world")).toBeInTheDocument();
  });

  it("should be visible on mouseenter using data attributes", async () => {
    render(
      <div>
        <button id="test-tooltip">Test Button</button>
        <Tooltip anchorId="test-tooltip">Hello world</Tooltip>
      </div>
    );
    const button = screen.getByText("Test Button");
    fireEvent.mouseEnter(button);
    expect(await screen.findByText("Hello world")).toBeInTheDocument();
  });

  it("should be visible on focus using data attributes", async () => {
    render(
      <>
        <button id="test-tooltip">Test Button</button>
        <Tooltip anchorId="test-tooltip">Hello world</Tooltip>
      </>
    );
    const button = screen.getByText("Test Button");
    fireEvent.focus(button);
    expect(await screen.findByText("Hello world")).toBeInTheDocument();
  });
});
