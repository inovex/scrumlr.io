import {act, fireEvent, screen} from "@testing-library/react";
import {Mock, vi} from "vitest";
import {render} from "testUtils";
import {ImportBoard} from "../ImportBoard";
import {Toast} from "utils/Toast";
import * as boardThunks from "store/features/board/thunks";

vi.mock("utils/Toast", () => ({
  Toast: {
    error: vi.fn(),
  },
}));

vi.mock("store/features/board/thunks", async () => {
  const actual = await vi.importActual<typeof import("store/features/board/thunks")>("store/features/board/thunks");
  return {
    ...actual,
    importBoard: vi.fn(),
  };
});

const validImportData = {
  board: {name: "Test Board", accessPolicy: "PUBLIC"},
  columns: [],
  notes: [],
  participants: [],
  voting: null,
};

describe("ImportBoard", () => {
  let onClose: Mock;
  let readAsTextMock: ReturnType<typeof vi.fn>;
  let fileReaderInstance: {
    readAsText: ReturnType<typeof vi.fn>;
    onload: ((e: {target?: {result?: string}}) => void) | null;
    onerror: (() => void) | null;
  };

  // before tests, mock timers, FileReader, and setup portal
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    onClose = vi.fn();

    readAsTextMock = vi.fn();
    fileReaderInstance = {
      readAsText: readAsTextMock,
      onload: null,
      onerror: null,
    };

    global.FileReader = vi.fn().mockImplementation(function () {
      return fileReaderInstance;
    }) as unknown as typeof FileReader;

    vi.spyOn(boardThunks, "importBoard").mockReturnValue({type: "board/importBoard"} as any);

    const portal = document.createElement("div");
    portal.setAttribute("id", "portal");
    document.body.appendChild(portal);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    document.getElementById("portal")?.remove();
  });

  const renderImportBoard = () => render(<ImportBoard onClose={onClose} />);

  const selectJsonFile = async (content: string, fileName = "board.json") => {
    const fileInput = screen.getByLabelText("Select JSON file");
    const file = new File([content], fileName, {type: "application/json"});

    await act(async () => {
      fireEvent.change(fileInput, {target: {files: [file]}});
    });

    await act(async () => {
      fileReaderInstance.onload?.({target: {result: content}});
    });
  };

  it("renders FileDropzoneCard by default", () => {
    renderImportBoard();

    expect(document.querySelector(".file-dropzone-card")).toBeInTheDocument();
    expect(document.querySelector(".file-preview")).not.toBeInTheDocument();
    expect(document.querySelector(".import-board__error-container")).not.toBeInTheDocument();
    expect(document.querySelector("[data-cy=simple-modal__primary-button]")).toBeDisabled();
  });

  it("renders FilePreview after a valid file import", async () => {
    renderImportBoard();

    await selectJsonFile(JSON.stringify(validImportData), "board.json");

    expect(document.querySelector(".file-dropzone-card")).not.toBeInTheDocument();
    expect(document.querySelector(".file-preview")).toBeInTheDocument();

    // since there's a delay before state is updated, wait for the artificial timer to finish
    await act(async () => {
      vi.runAllTimers();
    });

    expect(document.querySelector("[data-cy=simple-modal__primary-button]")).not.toBeDisabled();
  });

  it("shows the error container for an invalid JSON import", async () => {
    renderImportBoard();

    const fileInput = screen.getByLabelText("Select JSON file");
    const file = new File(["not valid json"], "bad.json", {type: "application/json"});
    fireEvent.change(fileInput, {target: {files: [file]}});

    await act(async () => {
      fileReaderInstance.onload?.({target: {result: "{not json"}} as any);
    });

    expect(Toast.error).toHaveBeenCalled();
    expect(document.querySelector(".file-preview")).not.toBeInTheDocument();
    expect(document.querySelector(".import-board__error-container")).toBeInTheDocument();
    expect(document.querySelector("[data-cy=simple-modal__primary-button]")).toBeDisabled();
  });

  it("calls onClose when Cancel is clicked", () => {
    renderImportBoard();
    fireEvent.click(screen.getByRole("button", {name: "Cancel"}));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
