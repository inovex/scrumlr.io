import {fireEvent, render, waitFor} from "@testing-library/react";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";
import {exportAsJSON, exportAsCSV} from "../../../../utils/export";
import {ExportBoard} from "../ExportBoard";

const mockStore = configureStore();

const initialState = {
  board: {
    data: {
      id: "boardId",
    },
  },
  users: {
    all: [
      {
        id: "test-id",
        displayName: "Max Mustermann",
      },
    ],
  },
};

jest.mock("utils/export", () => ({
  ...jest.requireActual("utils/export"),
  exportAsJSON: jest.fn(),
  exportAsCSV: jest.fn(),
  exportAsCSVZip: jest.fn(),
}));

const renderExportBoard = () => {
  const mockedStore = mockStore(initialState);
  return render(
    <Provider store={mockedStore}>
      <ExportBoard />
    </Provider>
  );
};

describe("Export Boad Tests", () => {
  test("render ExportBoard correctly", async () => {
    const exportBoard = renderExportBoard();
    expect(exportBoard).toMatchSnapshot();
  });

  test("json function called", async () => {
    const exportBoard = renderExportBoard();
    expect(exportBoard.getByTestId("export-json")).not.toBeNull();

    const button = exportBoard.getByTestId("export-json")!;
    fireEvent.click(button);

    await waitFor(() => {
      expect(exportAsJSON).toBeCalled();
    });
  });

  test("csv function called", async () => {
    const exportBoard = renderExportBoard();
    expect(exportBoard.getByTestId("export-csv")).not.toBeNull();

    const button = exportBoard.getByTestId("export-csv")!;
    fireEvent.click(button);

    await waitFor(() => {
      expect(exportAsCSV).toBeCalled();
    });
  });
});
