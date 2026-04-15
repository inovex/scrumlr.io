import {FilePreview, FileState} from "components/ImportBoard/FilePreview/FilePreview";
import {render} from "testUtils";
import {act} from "@testing-library/react";

describe("FilePreview", () => {
  const renderFilePreview = (name: string, state: FileState, onRemove?: () => void) => render(<FilePreview name={name} state={state} onRemove={onRemove ?? vi.fn} />);

  it("should render loading", () => {
    const {container} = renderFilePreview("test.json", "loading");

    expect(container).toMatchSnapshot();
  });

  it("should render loaded", () => {
    const {container} = renderFilePreview("test.json", "ready");

    expect(container).toMatchSnapshot();
  });

  it("should call back remove on click", () => {
    const mockOnRemove = vi.fn();
    const {container} = renderFilePreview("test.json", "ready", mockOnRemove);

    const removeButton: HTMLButtonElement = container.querySelector("[data-cy=file-preview__file-remove-button]")!;

    act(() => {
      removeButton.click();
    });

    expect(mockOnRemove).toHaveBeenCalled();
  });
});
