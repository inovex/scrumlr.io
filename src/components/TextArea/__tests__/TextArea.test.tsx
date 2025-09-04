import React from "react";
import {render, fireEvent} from "@testing-library/react";
import {Provider} from "react-redux";
import {TextArea} from "../TextArea";
import getTestStore from "utils/test/getTestStore";

describe("TextArea", () => {
  const defaultProps = {
    input: "Test content",
    setInput: jest.fn(),
  };

  const renderTextArea = (props: any) => {
    return render(
      <Provider store={getTestStore()}>
        <TextArea {...props} />
      </Provider>
    );
  };

  it("should render with readOnly prop", () => {
    const {container} = renderTextArea({...defaultProps, readOnly: true});
    const textarea = container.querySelector("textarea")!;

    expect(textarea).toBeTruthy();
    expect(textarea.readOnly).toBe(true);
    expect(textarea.disabled).toBe(false);
    expect(textarea.value).toBe("Test content");
  });

  it("should render with disabled prop", () => {
    const {container} = renderTextArea({...defaultProps, disabled: true});
    const textarea = container.querySelector("textarea")!;

    expect(textarea).toBeTruthy();
    expect(textarea.disabled).toBe(true);
    expect(textarea.readOnly).toBe(false);
    expect(textarea.value).toBe("Test content");
  });

  it("should handle double-click events when readOnly", () => {
    const onDoubleClick = jest.fn();
    const {container} = renderTextArea({...defaultProps, readOnly: true, onDoubleClick});
    const textarea = container.querySelector("textarea")!;

    fireEvent.doubleClick(textarea);
    expect(onDoubleClick).toHaveBeenCalledTimes(1);
  });

  it("should not handle double-click events when disabled", () => {
    const onDoubleClick = jest.fn();
    const {container} = renderTextArea({...defaultProps, disabled: true, onDoubleClick});
    const textarea = container.querySelector("textarea")!;

    fireEvent.doubleClick(textarea);
    // Disabled elements typically don't receive events
    expect(onDoubleClick).toHaveBeenCalledTimes(0);
  });

  it("should have readOnly attribute set correctly", () => {
    const setInput = jest.fn();
    const {container} = renderTextArea({
      input: "Original content",
      setInput,
      readOnly: true,
    });
    const textarea = container.querySelector("textarea")!;

    // Verify the readOnly attribute is set
    expect(textarea.readOnly).toBe(true);
    expect(textarea.getAttribute("readonly")).not.toBeNull();

    expect(textarea.value).toBe("Original content");
  });

  it("should allow editing when neither readOnly nor disabled", () => {
    const setInput = jest.fn();
    const {container} = renderTextArea({
      input: "Original content",
      setInput,
    });
    const textarea = container.querySelector("textarea")!;

    expect(textarea.readOnly).toBe(false);
    expect(textarea.disabled).toBe(false);
  });

  it("should preserve other props when readOnly is set", () => {
    const {container} = renderTextArea({
      ...defaultProps,
      readOnly: true,
      placeholder: "Test placeholder",
      className: "custom-class",
      rows: 5,
    });
    const textarea = container.querySelector("textarea")!;

    expect(textarea.readOnly).toBe(true);
    expect(textarea.placeholder).toBe("Test placeholder");
    expect(textarea.className).toContain("custom-class");
  });
});
