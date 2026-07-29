import {vi} from "vitest";
import {SERVER_HTTP_URL} from "config";
import {BoardImportData} from "store/features/board/types";
import {BoardAPI} from "../board";

describe("BoardAPI", () => {
  const payload = {
    board: {
      name: "Imported Board",
      accessPolicy: "PUBLIC",
    },
    columns: [],
    notes: [],
    participants: [] as unknown as BoardImportData["participants"],
    voting: null as unknown as BoardImportData["voting"],
  } as BoardImportData;

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("importBoard returns the full import response body", async () => {
    const responseBody = {
      id: "new-board-id",
      importWarnings: {
        removedNotesMissingAuthorCount: 2,
      },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      status: 201,
      json: vi.fn().mockResolvedValue(responseBody),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(BoardAPI.importBoard(payload)).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledWith(`${SERVER_HTTP_URL}/import`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  });

  it("importBoard throws for non-201 responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({status: 500});
    vi.stubGlobal("fetch", fetchMock);

    await expect(BoardAPI.importBoard(payload)).rejects.toThrow("unable to import board");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
