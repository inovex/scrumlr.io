import {exportAsJSON, exportAsCSV, exportAsCSVZip, ExportProps, fileName, generateCSV} from "utils/export";
import FileSaver from "file-saver";

jest.mock("file-saver", () => ({saveAs: jest.fn()}));
global.Blob = function (content, options) {
  return {content, options};
};

const state: ExportProps = {
  board: {
    id: "test",
    columns: [{id: "GG0fWzyCwd", name: "Positive", hidden: false, color: "green"}],
  },
  notes: [{id: "1", columnId: "test_column", text: "", author: "", parentId: "0", dirty: true, authorName: "", votes: []}],
  votes: [
    {
      id: "test-vote-0",
      board: "test-board",
      note: "test-id",
      user: "test-user-1",
      votingIteration: 1,
    },
  ],
  users: {
    admins: [],
    basic: [],
    all: [],
  },
};

describe("Export methods", () => {
  test("json function called", () => {
    exportAsJSON(state);
    expect(FileSaver.saveAs).toHaveBeenCalledWith({content: [JSON.stringify(state)], options: {type: "application/json"}}, `${fileName(state)}.json`);
  });

  test("csv function called", () => {
    exportAsCSV(state);
    const csvs = generateCSV(state);
    let csv = "";
    csvs.forEach((entry) => {
      csv += entry;
      csv += "\n\n";
    });
    expect(FileSaver.saveAs).toHaveBeenCalledWith({content: [csv], options: {type: "text/csv"}}, `${fileName(state)}.csv`);
  });
});
