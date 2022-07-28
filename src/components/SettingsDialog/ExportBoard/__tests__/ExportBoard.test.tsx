import {fireEvent, render, waitFor} from "@testing-library/react";
import {Provider} from "react-redux";
import {exportAsJSON, exportAsCSV} from "utils/export";
import {ExportBoard} from "../ExportBoard";
import {I18nextProvider} from "react-i18next";
import i18nTest from "i18nTest";
import getTestStore from "utils/test/getTestStore";
import {BrowserRouter} from "react-router-dom";

jest.mock("utils/export", () => ({
  ...jest.requireActual("utils/export"),
  exportAsJSON: jest.fn(),
  exportAsCSV: jest.fn(),
}));

const renderExportBoard = () => {
  return render(
    <I18nextProvider i18n={i18nTest}>
      <Provider store={getTestStore()}>
        <BrowserRouter>
          <ExportBoard />
        </BrowserRouter>
      </Provider>
    </I18nextProvider>
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
