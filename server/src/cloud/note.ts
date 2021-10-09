import {getAdminRoleName, getMemberRoleName, isAdmin, requireValidBoardMember} from "./permission";
import {api, newObject} from "./util";

interface AddNoteRequest {
  boardId: string;
  columnId: string;
  text: string;
}

type EditableNoteAttributes = {
  columnId: string;
  parentId: string;
  text: string;
  focus: boolean;
};

type EditNoteRequest = {id: string} & Partial<EditableNoteAttributes>;

interface DeleteNoteRequest {
  noteId: string;
}

export const initializeNoteFunctions = () => {
  api<AddNoteRequest, boolean>("addNote", async (user, request) => {
    await requireValidBoardMember(user, request.boardId);
    const note = newObject(
      "Note",
      {
        text: request.text,
        author: user,
        board: Parse.Object.extend("Board").createWithoutData(request.boardId),
        columnId: request.columnId,
        focus: false,
      },
      {
        readRoles: [getMemberRoleName(request.boardId), getAdminRoleName(request.boardId)],
        writeRoles: [getAdminRoleName(request.boardId)],
      }
    );
    await note.save(null, {useMasterKey: true});
    return true;
  });

  api<{note: EditNoteRequest}, boolean>("editNote", async (user, request) => {
    const query = new Parse.Query(Parse.Object.extend("Note"));
    const note = await query.get(request.note.id, {useMasterKey: true});

    if (!note) {
      return false;
    }

    if (request.note.parentId) {
      if (request.note.parentId === "unstack") note.unset("parent");
      else note.set("parent", Parse.Object.extend("Note").createWithoutData(request.note.parentId));
    }

    if (request.note.columnId) {
      note.set("columnId", request.note.columnId);

      const childNotesQuery = new Parse.Query("Note");
      childNotesQuery.equalTo("parent", Parse.Object.extend("Note").createWithoutData(request.note.id));
      await childNotesQuery.find({useMasterKey: true}).then(async (childNotes) => {
        childNotes.forEach(
          (childNote) => {
            childNote.set("columnId", request.note.columnId);
          },
          {useMasterKey: true}
        );
        await Parse.Object.saveAll(childNotes, {useMasterKey: true});
      });
    }

    if (request.note.text) {
      if ((await isAdmin(user, note.get("board").id)) || user.id === note.get("author").id) {
        note.set("text", request.note.text);
      } else {
        throw new Error(`Not authorized to edit note '${request.note.id}'`);
      }
    }

    if (request.note.focus != undefined) {
      note.set("focus", request.note.focus);
    }

    await note.save(null, {useMasterKey: true});
    return true;
  });

  api<DeleteNoteRequest, boolean>("deleteNote", async (user, request) => {
    const query = new Parse.Query(Parse.Object.extend("Note"));
    const note = await query.get(request.noteId, {useMasterKey: true});

    if ((await isAdmin(user, note.get("board").id)) || user.id === note.get("author").id) {
      // Find any note which has this note as stack parent and unset that
      const childNotesQuery = new Parse.Query(Parse.Object.extend("Note"));
      childNotesQuery.equalTo("parent", note);
      childNotesQuery.find({useMasterKey: true}).then(async (childNotes) => {
        childNotes.forEach(
          (childNote) => {
            childNote.unset("parent");
          },
          {useMasterKey: true}
        );
        await Parse.Object.saveAll(childNotes, {useMasterKey: true});
      });
      // Find and delete all votes of this note including the note itself
      const voteQuery = new Parse.Query("Vote");
      voteQuery.equalTo("note", note);
      await Parse.Object.destroyAll([note, ...(await voteQuery.find({useMasterKey: true}))], {useMasterKey: true});
      return true;
    }

    throw new Error(`Not authorized to delete note '${request.noteId}'`);
  });
};
