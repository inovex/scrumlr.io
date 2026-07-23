import {API} from "api";
import getTestStore from "utils/test/getTestStore";
import {EditableTemplateColumn, saveBoardEdit} from "store/features";

afterEach(() => {
  vi.restoreAllMocks();
});

// builds an editable column
const col = (overrides: Partial<EditableTemplateColumn>): EditableTemplateColumn => ({
  id: "col",
  template: "board-1",
  name: "Column",
  description: "",
  color: "backlog-blue",
  visible: true,
  index: 0,
  persisted: true,
  ...overrides,
});

describe("saveBoardEdit", () => {
  it("saves metadata, routes each column to its endpoint by mode, and leaves untouched columns alone", async () => {
    const editBoard = vi.spyOn(API, "editBoard").mockResolvedValue({});
    const createColumn = vi.spyOn(API, "createColumn").mockResolvedValue({});
    const editColumn = vi.spyOn(API, "editColumn").mockResolvedValue({});
    const deleteColumn = vi.spyOn(API, "deleteColumn").mockResolvedValue(undefined);
    const getBoards = vi.spyOn(API, "getBoards").mockResolvedValue([]);

    const store = getTestStore();

    await store.dispatch(
      saveBoardEdit({
        boardId: "board-1",
        name: "New name",
        description: "New description",
        columns: [
          col({id: "new-col", name: "Added", color: "goal-green", index: 2, persisted: false, mode: "create"}),
          col({id: "c2", name: "Renamed", color: "planning-pink", index: 1, mode: "edit"}),
          col({id: "c3", name: "Untouched", index: 0, mode: undefined}),
        ],
        deletedColumns: [col({id: "c4", name: "Removed", mode: "delete"})],
      })
    );

    // board metadata goes through editBoard
    expect(editBoard).toHaveBeenCalledWith("board-1", {name: "New name", description: "New description"});

    // created column -> createColumn (no id/description sent)
    expect(createColumn).toHaveBeenCalledTimes(1);
    expect(createColumn).toHaveBeenCalledWith("board-1", {name: "Added", color: "goal-green", visible: true, index: 2});

    // edited column -> editColumn (addressed by id)
    expect(editColumn).toHaveBeenCalledTimes(1);
    expect(editColumn).toHaveBeenCalledWith("board-1", "c2", {name: "Renamed", description: "", color: "planning-pink", visible: true, index: 1});

    // deleted column -> deleteColumn
    expect(deleteColumn).toHaveBeenCalledTimes(1);
    expect(deleteColumn).toHaveBeenCalledWith("board-1", "c4");

    // untouched column c3 must not hit any column endpoint.
    expect(editColumn).not.toHaveBeenCalledWith("board-1", "c3", expect.anything());
    expect(createColumn).not.toHaveBeenCalledWith("board-1", expect.objectContaining({name: "Untouched"}));

    // the save refetches once to confirm with server truth.
    expect(getBoards).toHaveBeenCalledTimes(1);
  });
});
