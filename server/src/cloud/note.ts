import {getAdminRoleName, getMemberRoleName, isAdmin, requireValidBoardMember} from "./permission";
import {api, newObject} from "./util";

interface AddNoteRequest {
  boardId: string;
  columnId: string;
  text: string;
}

type EditableNoteAttributes = {
  text: string;
  focus: boolean;
};

interface UnstackNoteRequest {
  boardId: string;
  note: {
    id: string;
    parentId: string;
  };
}

interface DragNoteRequest {
  boardId: string;
  note: {
    id: string;
    dragOnId: string;
    columnId: string;
  };
}

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
        positionInStack: -1,
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

  api<UnstackNoteRequest, boolean>("unstackNote", async (user, request) => {
    await requireValidBoardMember(user, request.boardId);
    const query = new Parse.Query(Parse.Object.extend("Note"));
    const note = await query.get(request.note.id, {useMasterKey: true});

    if (!note) {
      return false;
    }

    if (request.note.parentId) {
      const parent = await query.get(request.note.parentId, {useMasterKey: true});

      // Get all notes of parent
      const childNotesParentQuery = new Parse.Query("Note");
      childNotesParentQuery.equalTo("parent", parent);
      const childNotesParent = await childNotesParentQuery.findAll({useMasterKey: true});

      // Remove note from stack and set position to -1
      note.unset("parent");
      note.set("positionInStack", -1);

      // Update position of children
      childNotesParent
        .filter((childNote) => childNote != note)
        .sort((a, b) => a.get("positionInStack") - b.get("positionInStack"))
        .forEach(
          (childNote, index) => {
            childNote.set("positionInStack", index + 1);
          },
          {useMasterKey: true}
        );

      // Save updates for children
      if (childNotesParent.length != 0) {
        await Parse.Object.saveAll(childNotesParent, {useMasterKey: true});
      }
    }

    await note.save(null, {useMasterKey: true});
    return true;
  });

  api<DragNoteRequest, boolean>("dragNote", async (user, request) => {
    await requireValidBoardMember(user, request.boardId);
    const query = new Parse.Query(Parse.Object.extend("Note"));
    const note = await query.get(request.note.id, {useMasterKey: true});

    if (!note) {
      return false;
    }

    console.log(request);

    // Find all notes with the edited note as parent
    const childNotesQuery = new Parse.Query("Note");
    childNotesQuery.equalTo("parent", note);
    const childNotes = await childNotesQuery.findAll({useMasterKey: true});

    if (request.note.dragOnId) {
      // Set note as new parent
      note.set("positionInStack", 0);

      // Get the note to which the note is dragged
      const dragedOn = await query.get(request.note.dragOnId, {useMasterKey: true});

      const childNotesDragedOnQuery = new Parse.Query("Note");
      childNotesDragedOnQuery.equalTo("parent", dragedOn);
      const childNotesDragedOn = await childNotesDragedOnQuery.findAll({useMasterKey: true});

      // Update childes of dragedOn note
      dragedOn.set("parent", Parse.Object.extend("Note").createWithoutData(request.note.id));
      dragedOn.set("positionInStack", childNotes.length + 1);
      childNotesDragedOn
        .sort((a, b) => a.get("positionInStack") - b.get("positionInStack"))
        .forEach(
          (childNote, index) => {
            childNote.set("parent", Parse.Object.extend("Note").createWithoutData(request.note.id));
            childNote.set("positionInStack", index + childNotes.length + 2);
          },
          {useMasterKey: true}
        );

      // Save old parent first -> old children are not visible during updates
      await dragedOn.save(null, {useMasterKey: true});

      if (childNotesDragedOn.length != 0) {
        await Parse.Object.saveAll(childNotesDragedOn, {useMasterKey: true});
      }
    }

    if (request.note.columnId) {
      note.set("columnId", request.note.columnId);
      childNotes.forEach(
        (childNote) => {
          childNote.set("columnId", request.note.columnId);
        },
        {useMasterKey: true}
      );
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
            childNote.set("positionInStack", -1);
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
