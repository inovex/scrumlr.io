import {mapNoteServerToClientModel, NoteClientModel, NoteServerModel} from "../note";

describe("Note types", () => {
  test("mapNoteServerToClientModel", async () => {
    const map = {
      author: {id: "5"} as unknown as Parse.Object,
      parent: {id: "5"} as unknown as Parse.Object,
      columnId: "test_columnId",
      text: "test_text",
      focus: false,
      createdAt: new Date(1234),
      updatedAt: new Date(1234),
    };

    const serverModel = {
      id: "5",
      get: (s: string) => map[s],
    } as unknown as NoteServerModel;

    const clientModel: NoteClientModel = mapNoteServerToClientModel(serverModel);

    expect(clientModel.id).toEqual(serverModel.id);
    expect(clientModel.columnId).toEqual(serverModel.get("columnId"));
    expect(clientModel.text).toEqual(serverModel.get("text"));
    expect(clientModel.focus).toEqual(serverModel.get("focus"));
    expect(clientModel.createdAt).toEqual(serverModel.get("createdAt"));
    expect(clientModel.updatedAt).toEqual(serverModel.get("updatedAt"));
    expect(clientModel.author).toEqual(serverModel.get("author").id);
    expect(clientModel.parentId).toEqual(serverModel.get("parent").id);
    expect(clientModel.dirty).toEqual(false);
  });
});
