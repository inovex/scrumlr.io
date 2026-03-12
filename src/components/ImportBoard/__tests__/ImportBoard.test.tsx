import {act, fireEvent, screen} from "@testing-library/react";
import {render} from "testUtils";
import {ImportBoard} from "../ImportBoard";
import * as boardThunks from "store/features/board/thunks";
import {Toast} from "utils/Toast";
import {vi, Mock} from "vitest";

vi.mock("utils/Toast", () => ({
  Toast: {
    error: vi.fn(),
  },
}));

const mockFileReaderInstance = {
  readAsText: vi.fn(),
  onload: null as ((e: {target: {result: string}}) => void) | null,
  onerror: null as (() => void) | null,
};

const validImportData = {
  board: {name: "Test Board", accessPolicy: "PUBLIC"},
  columns: [],
  notes: [],
  participants: [],
  voting: null,
};

describe("ImportBoard", () => {
  let onClose: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    onClose = vi.fn();
    mockFileReaderInstance.readAsText = vi.fn();
    mockFileReaderInstance.onload = null;
    mockFileReaderInstance.onerror = null;
    // TODO check possibility of using stubGlobal
    global.FileReader = vi.fn().mockImplementation(function () {
      return mockFileReaderInstance;
    }) as unknown as typeof FileReader;
    vi.spyOn(boardThunks, "importBoard").mockReturnValue({type: "board/importBoard"} as any);
    const portal = document.createElement("div");
    portal.setAttribute("id", "portal");
    document.body.appendChild(portal);
  });

  afterEach(() => {
    document.getElementById("portal")?.remove();
  });

  const renderImportBoard = () => render(<ImportBoard onClose={onClose} />);

  const simulateFileLoad = async (content: string, fileName = "test.json") => {
    const fileInput = screen.getByLabelText("Select JSON file");
    const mockFile = new File([content], fileName, {type: "application/json"});
    fireEvent.change(fileInput, {target: {files: [mockFile]}});
    await act(async () => {
      mockFileReaderInstance.onload?.({target: {result: content}});
    });
  };

  it("renders file step with dropzone by default", () => {
    renderImportBoard();
    expect(screen.getByText("Upload file or drag here")).toBeInTheDocument();
  });

  it("has Continue button disabled initially", () => {
    renderImportBoard();
    expect(screen.getByRole("button", {name: "Continue"})).toBeDisabled();
  });

  it("calls onClose when Cancel button is clicked", () => {
    renderImportBoard();
    fireEvent.click(screen.getByRole("button", {name: "Cancel"}));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", () => {
    renderImportBoard();
    fireEvent.click(screen.getByRole("button", {name: "Close modal"}));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows file success and enables Continue after valid JSON file is selected", async () => {
    renderImportBoard();
    await simulateFileLoad(JSON.stringify(validImportData), "board.json");
    expect(screen.getByText(/File loaded: board\.json/)).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Continue"})).not.toBeDisabled();
  });

  it("shows error message for invalid JSON file", async () => {
    renderImportBoard();
    const fileInput = screen.getByLabelText("Select JSON file");
    const mockFile = new File(["not json"], "bad.json", {type: "application/json"});
    fireEvent.change(fileInput, {target: {files: [mockFile]}});
    await act(async () => {
      mockFileReaderInstance.onload?.({target: {result: "not valid json {{{"}});
    });
    expect(screen.getByText("The file could not be read. Please use a valid JSON export.")).toBeInTheDocument();
    expect(Toast.error).toHaveBeenCalled();
  });

  it("handles drag-and-drop of valid JSON file", async () => {
    renderImportBoard();
    const dropzone = screen.getByText("Upload file or drag here").closest("div")!;
    const mockFile = new File([JSON.stringify(validImportData)], "dropped.json", {type: "application/json"});
    fireEvent.drop(dropzone, {dataTransfer: {files: [mockFile]}});
    await act(async () => {
      mockFileReaderInstance.onload?.({target: {result: JSON.stringify(validImportData)}});
    });
    expect(screen.getByText(/File loaded:/)).toBeInTheDocument();
  });

  it("advances to access step when Continue is clicked after file is loaded", async () => {
    renderImportBoard();
    await simulateFileLoad(JSON.stringify(validImportData));
    fireEvent.click(screen.getByRole("button", {name: "Continue"}));
    expect(screen.getByRole("button", {name: "Back"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Open Board"})).toBeInTheDocument();
  });

  it("returns to file step when Back is clicked in access step", async () => {
    renderImportBoard();
    await simulateFileLoad(JSON.stringify(validImportData));
    fireEvent.click(screen.getByRole("button", {name: "Continue"}));
    fireEvent.click(screen.getByRole("button", {name: "Back"}));
    // importData is retained on Back, so dropzone shows success state not the empty prompt
    expect(screen.queryByRole("button", {name: "Open Board"})).not.toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Continue"})).toBeInTheDocument();
  });

  it("dispatches importBoard with PUBLIC policy when Open Board is clicked", async () => {
    renderImportBoard();
    await simulateFileLoad(JSON.stringify(validImportData));
    fireEvent.click(screen.getByRole("button", {name: "Continue"}));
    fireEvent.click(screen.getByRole("button", {name: "Open Board"}));
    const expectedData = {...validImportData, board: {...validImportData.board, accessPolicy: "PUBLIC"}};
    expect(boardThunks.importBoard).toHaveBeenCalledWith(JSON.stringify(expectedData));
  });

  it("dispatches importBoard with BY_PASSPHRASE policy and passphrase", async () => {
    renderImportBoard();
    await simulateFileLoad(JSON.stringify(validImportData));
    fireEvent.click(screen.getByRole("button", {name: "Continue"}));
    // Select the "Password Protected" option
    fireEvent.click(screen.getByRole("button", {name: /Password Protected/}));
    // Enter passphrase — Input component uses onInput (not onChange), so use fireEvent.input
    const passwordInput = screen.getByPlaceholderText("Enter password here");
    fireEvent.input(passwordInput, {target: {value: "secret123"}});
    fireEvent.click(screen.getByRole("button", {name: "Open Board"}));
    expect(boardThunks.importBoard).toHaveBeenCalledWith(
      JSON.stringify({...validImportData, board: {...validImportData.board, accessPolicy: "BY_PASSPHRASE", passphrase: "secret123"}})
    );
  });
});
