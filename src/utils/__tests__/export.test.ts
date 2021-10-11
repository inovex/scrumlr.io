import {waitFor} from "@testing-library/react";
import {exportAsCSV, exportAsJSON, ExportProps, fileName, generateCSV, mapToExport} from "utils/export";

jest.mock("file-saver", () => ({saveAs: jest.fn()}));

type TestProps = {
  userAvaiable: boolean;
  parentAvailable: boolean;
  noteIdAvailable: boolean;
  timestampAvailable: boolean;
};

const createState = (props: TestProps) =>
  ({
    board: {
      name: "board",
      columns: [{columnId: "test-column", name: "Positive", hidden: false, color: "retro-red"}],
      votingIteration: 1,
    },
    notes: [
      {
        id: props.noteIdAvailable ? "test-note" : undefined,
        columnId: "test-column",
        text: "test-text",
        author: "test-user-id",
        parentId: props.parentAvailable ? "note-parent" : undefined,
        dirty: true,
        focus: false,
        createdAt: props.timestampAvailable ? new Date(12345) : undefined,
      },
    ],
    votes: [
      {
        id: "test-vote-0",
        board: "test-board",
        note: "test-note",
        user: "test-user-1",
        votingIteration: 1,
      },
    ],
    users: {
      admins: [],
      basic: [],
      all: props.userAvaiable
        ? [
            {
              displayName: "Test user",
              id: "test-user-id",
              createdAt: new Date(123456),
              updatedAt: new Date(123456),
              admin: false,
              online: true,
            },
          ]
        : [],
    },
  } as ExportProps);

const exportFormat = (props: TestProps) => [
  {
    noteId: props.noteIdAvailable ? "test-note" : "-",
    author: props.userAvaiable ? "Test user" : "test-user-id",
    text: "test-text",
    column: "Positive",
    timestamp: props.timestampAvailable ? new Date(12345).toLocaleTimeString() : "-",
    parent: props.parentAvailable ? "note-parent" : "-",
    votes: props.noteIdAvailable ? 1 : 0,
    voting_iteration_1: props.noteIdAvailable ? 1 : 0,
  },
];

describe("Export", () => {
  test("json function called", async () => {
    const state = createState({userAvaiable: true, noteIdAvailable: true, parentAvailable: true, timestampAvailable: true});
    const json = JSON.stringify(mapToExport(state), null, 2);
    const blob = new Blob([json], {type: "application/json"});
    const blobSpy = jest.spyOn(global, "Blob").mockImplementationOnce(() => blob);
    exportAsJSON(state);
    await waitFor(() => {
      expect(blobSpy).toHaveBeenCalledWith([json], {type: "application/json"});
    });
  });

  test("csv function called", async () => {
    const state = createState({userAvaiable: true, noteIdAvailable: true, parentAvailable: true, timestampAvailable: true});
    const csv = generateCSV(state);
    const blob = new Blob([csv], {type: "text/csv"});
    const blobSpy = jest.spyOn(global, "Blob").mockImplementationOnce(() => blob);
    exportAsCSV(state);
    await waitFor(() => {
      expect(blobSpy).toHaveBeenCalledWith([csv], {type: "text/csv"});
    });
  });

  test("correct file name", () => {
    const state = createState({userAvaiable: true, noteIdAvailable: true, parentAvailable: true, timestampAvailable: true});
    const mockDate = new Date(12345678);
    const dateSpy = jest.spyOn(global, "Date").mockImplementationOnce(() => mockDate as unknown as string);
    const name = fileName(state);
    expect(name).toEqual("1970-01-01_board");
    dateSpy.mockRestore();
  });

  test("correct export mapping with available user", () => {
    const props = {userAvaiable: true, noteIdAvailable: true, parentAvailable: true, timestampAvailable: true};
    const state = createState(props);
    const mappedExport = mapToExport(state);
    expect(mappedExport).toEqual(exportFormat(props));
  });

  test("correct export mapping without available user", () => {
    const props = {userAvaiable: false, noteIdAvailable: true, parentAvailable: true, timestampAvailable: true};
    const state = createState(props);
    const mappedExport = mapToExport(state);
    expect(mappedExport).toEqual(exportFormat(props));
  });

  test("correct export mapping without noteId", () => {
    const props = {userAvaiable: true, noteIdAvailable: false, parentAvailable: true, timestampAvailable: true};
    const state = createState(props);
    const mappedExport = mapToExport(state);
    expect(mappedExport).toEqual(exportFormat(props));
  });

  test("correct export mapping without parent", () => {
    const props = {userAvaiable: true, noteIdAvailable: true, parentAvailable: false, timestampAvailable: true};
    const state = createState(props);
    const mappedExport = mapToExport(state);
    expect(mappedExport).toEqual(exportFormat(props));
  });

  test("correct export mapping without timestamp", () => {
    const props = {userAvaiable: false, noteIdAvailable: true, parentAvailable: true, timestampAvailable: false};
    const state = createState(props);
    const mappedExport = mapToExport(state);
    expect(mappedExport).toEqual(exportFormat(props));
  });
});
