import {render} from "testUtils";
import {Button} from "../Button";
import {fireEvent, screen} from "@testing-library/react";

describe("Button", () => {
  it("should render with default props", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", {name: "Click me"});
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("button", "button--primary");
  });

  it("should render with different button types", () => {
    const {rerender} = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toHaveClass("button--secondary");

    rerender(<Button variant="tertiary">Tertiary</Button>);
    expect(screen.getByRole("button")).toHaveClass("button--tertiary");
  });

  it("should render as disabled", () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should render with custom className", () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should render with icon", () => {
    const icon = <span data-testid="test-icon">📌</span>;
    render(<Button icon={icon}>With Icon</Button>);

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveClass("button--with-icon");
  });

  it("should render as small button", () => {
    render(<Button small>Small</Button>);

    expect(screen.getByRole("button")).toHaveClass("button--small");
  });

  it("should handle click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not trigger click when disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should render with native title attribute", () => {
    render(<Button title="Native tooltip">With Title</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Native tooltip");
  });

  it("should render with react-tooltip data attributes", () => {
    render(
      <Button dataTooltipId="custom-tooltip" dataTooltipContent="Custom tooltip content">
        With Tooltip
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-tooltip-id", "custom-tooltip");
    expect(button).toHaveAttribute("data-tooltip-content", "Custom tooltip content");
  });

  it("should render with both title and react-tooltip attributes", () => {
    render(
      <Button title="Native tooltip" dataTooltipId="react-tooltip" dataTooltipContent="React tooltip content">
        With Both Tooltips
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title", "Native tooltip");
    expect(button).toHaveAttribute("data-tooltip-id", "react-tooltip");
    expect(button).toHaveAttribute("data-tooltip-content", "React tooltip content");
  });

  it("should render with data-cy attribute for testing", () => {
    render(<Button dataCy="test-button">Test Button</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-cy", "test-button");
  });

  it("should render with color classes", () => {
    render(<Button color="backlog-blue">Colored</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("accent-color__backlog-blue");
  });

  it("should use default planning-pink color when no color specified", () => {
    render(<Button>Default Color</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("accent-color__planning-pink");
  });

  it("should render tooltip attributes for accessibility when disabled", () => {
    render(
      <Button disabled dataTooltipId="disabled-tooltip" dataTooltipContent="This action is disabled">
        Disabled with Tooltip
      </Button>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-tooltip-id", "disabled-tooltip");
    expect(button).toHaveAttribute("data-tooltip-content", "This action is disabled");
  });

  it("should maintain all functionality when all props are provided", () => {
    const handleClick = vi.fn();
    const icon = <span data-testid="complex-icon">🔥</span>;

    render(
      <Button
        variant="secondary"
        className="complex-button"
        color="value-violet"
        small
        icon={icon}
        title="Complex button"
        dataTooltipId="complex-tooltip"
        dataTooltipContent="This is a complex button with all features"
        onClick={handleClick}
        dataCy="complex-test"
      >
        Complex Button
      </Button>
    );

    const button = screen.getByRole("button");

    // Check all classes
    expect(button).toHaveClass("button", "button--secondary", "button--small", "button--with-icon", "complex-button", "accent-color__value-violet");

    // Check all attributes
    expect(button).toHaveAttribute("title", "Complex button");
    expect(button).toHaveAttribute("data-tooltip-id", "complex-tooltip");
    expect(button).toHaveAttribute("data-tooltip-content", "This is a complex button with all features");
    expect(button).toHaveAttribute("data-cy", "complex-test");

    // Check icon
    expect(screen.getByTestId("complex-icon")).toBeInTheDocument();

    // Check functionality
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
