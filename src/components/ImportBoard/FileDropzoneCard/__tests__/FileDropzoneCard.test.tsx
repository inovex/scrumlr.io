import {act, fireEvent, screen} from "@testing-library/react";
import {vi} from "vitest";
import {FileDropzoneCard} from "components/ImportBoard/FileDropzoneCard/FileDropzoneCard";
import {render} from "testUtils";

describe("FileDropzoneCard", () => {
  const renderFileDropzoneCard = (onFileSelect: (file: File) => void = vi.fn()) => render(<FileDropzoneCard onFileSelect={onFileSelect} />);

  it("renders FileDropzoneCard", () => {
    const {container} = renderFileDropzoneCard();

    expect(container).toMatchSnapshot();
  });

  it("delegates file select on file input change", async () => {
    const mockOnFileSelect = vi.fn();
    const {container} = renderFileDropzoneCard(mockOnFileSelect);

    const fileInput = container.querySelector("[data-cy=file-input]")!;

    const file = new File([""], "file.json", {type: "application/json"});

    await act(async () => {
      fireEvent.change(fileInput, {target: {files: [file]}});
    });

    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
  });

  it("delegates file select on drop", async () => {
    const mockOnFileSelect = vi.fn();
    const {container} = renderFileDropzoneCard(mockOnFileSelect);
    const dropzone = container.querySelector("[data-cy=file-dropzone]")!;

    const file = new File([""], "file.json", {type: "application/json"});

    await act(async () => {
      fireEvent.dragOver(dropzone);
      fireEvent.drop(dropzone, {
        dataTransfer: {files: [file]},
      });
    });

    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
  });
});
