import {test, expect} from "@playwright/test";
import {acceptCookies, createBoard, createNote, createNoteReaction, getBoardColumns, loginAnonymous, updateNote} from "./helpers/api";

test("should create a note", async ({page}) => {
  const name = "create note playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Board",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
    ],
  });

  await page.goto(`/board/${boardId}`);

  const startColumn = page.getByRole("region", {name: "Start", exact: true});
  const noteTextBox = startColumn.getByRole("textbox", {name: "Add your note..."});
  await noteTextBox.fill("Test note");

  const create = startColumn.getByRole("button", {name: "Create note"});
  await create.click();

  const note = startColumn.getByRole("article", {name: "Test note"});
  await expect(note).toBeVisible();
});

test("should edit a note", async ({page}) => {
  const name = "edit note playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Board",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
    ],
  });

  const columns = await getBoardColumns(page, boardId);
  await createNote(page, boardId, {column: columns[0].id, text: "Test note"});

  await page.goto(`/board/${boardId}`);

  const startColumn = page.getByRole("region", {name: "Start", exact: true});
  const note = startColumn.getByRole("article", {name: "Test note"});
  await note.click();

  const editInput = page.getByRole("textbox", {name: "Edit note"});
  await expect(editInput).toHaveValue("Test note");
  await editInput.fill("Edited note");

  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");

  const editedNote = startColumn.getByRole("article", {name: "Edited note"});
  await expect(editedNote).toBeVisible();
  await expect(note).not.toBeVisible();
});

test("should delete a note", async ({page}) => {
  const name = "delete note playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Board",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
    ],
  });

  const columns = await getBoardColumns(page, boardId);
  await createNote(page, boardId, {column: columns[0].id, text: "Test note"});

  await page.goto(`/board/${boardId}`);

  const startColumn = page.getByRole("region", {name: "Start", exact: true});
  const note = startColumn.getByRole("article", {name: "Test note"});
  await note.click();

  const deleteNote = page.getByRole("button", {name: "Delete this note"});
  await deleteNote.click();

  const submit = page.getByRole("button", {name: "Delete Note"});
  await submit.click();

  await expect(note).not.toBeVisible();
});

test("should move a note to another column", async ({page}) => {
  const name = "move note playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Board",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
    ],
  });

  const columns = await getBoardColumns(page, boardId);
  await createNote(page, boardId, {column: columns[0].id, text: "Move me"});

  await page.goto(`/board/${boardId}`);

  const startcolumn = page.getByRole("region", {name: "Start", exact: true});
  const stopColumn = page.getByRole("region", {name: "Stop", exact: true});

  const note = startcolumn.getByRole("article", {name: "Move me"});
  await expect(note).toBeVisible();

  await note.dragTo(stopColumn, {steps: 20});

  await expect(stopColumn.getByRole("article", {name: "Move me"})).toBeVisible();
  await expect(startcolumn.getByRole("article", {name: "Move me"})).not.toBeVisible();
});

test("should stack two notes", async ({page}) => {
  const name = "stack notes playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Board",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
    ],
  });

  const columns = await getBoardColumns(page, boardId);
  await createNote(page, boardId, {column: columns[0].id, text: "Note 1"});
  await createNote(page, boardId, {column: columns[0].id, text: "Note 2"});

  await page.goto(`/board/${boardId}`);

  const startColumn = page.getByRole("region", {name: "Start", exact: true});

  const note1 = startColumn.getByRole("article", {name: "Note 1"});
  await expect(note1).toBeVisible();

  const note2 = startColumn.getByRole("article", {name: "Note 2"});
  await expect(note2).toBeVisible();

  const target = await note1.boundingBox();

  await note2.dragTo(note1, {steps: 20, targetPosition: {x: target!.width / 2, y: 0}});

  await expect(startColumn.getByRole("article")).toHaveCount(1);
});

test("should unstack two notes", async ({page}) => {
  const name = "unstack notes playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Board",
    accessPolicy: "PUBLIC",
    columns: [
      {name: "Start", color: "goal-green", index: 0, visible: true},
      {name: "Stop", color: "online-orange", index: 1, visible: true},
    ],
  });

  const columns = await getBoardColumns(page, boardId);
  const note1Id = await createNote(page, boardId, {column: columns[0].id, text: "Note 1"});
  const note2Id = await createNote(page, boardId, {column: columns[0].id, text: "Note 2"});
  await updateNote(page, boardId, note2Id, {position: {column: columns[0].id, stack: note1Id, rank: 1}});

  await page.goto(`/board/${boardId}`);

  const startColumn = page.getByRole("region", {name: "Start", exact: true});

  const stack = startColumn.getByRole("article");
  await expect(stack).toHaveCount(1);

  await stack.first().click();

  const unstackButton = page.getByRole("button", {name: "Remove this note from stack"});
  await expect(unstackButton).toBeVisible();
  await unstackButton.click();

  await page.keyboard.press("Escape");

  const notes = startColumn.getByRole("article");
  await expect(notes).toHaveCount(2);
});

test("should react to a note", async ({page}) => {
  const name = "react note playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Board",
    accessPolicy: "PUBLIC",
    columns: [{name: "Start", color: "goal-green", index: 0, visible: true}],
  });

  const columns = await getBoardColumns(page, boardId);
  await createNote(page, boardId, {column: columns[0].id, text: "React to me"});

  await page.goto(`/board/${boardId}`);

  const startColumn = page.getByRole("region", {name: "Start", exact: true});
  const note = startColumn.getByRole("article", {name: "React to me"});
  await expect(note).toBeVisible();

  const reactionBar = note.getByRole("button", {name: "toggle the reaction bar"});
  await reactionBar.click();
  const reaction = page.getByRole("button", {name: "💖"});
  await reaction.click();

  const noteReaction = note.getByRole("button", {name: "💖 1"});
  await expect(noteReaction).toBeVisible();
});

test("should change the reaction on a note", async ({page}) => {
  const name = "change reaction playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Board",
    accessPolicy: "PUBLIC",
    columns: [{name: "Start", color: "goal-green", index: 0, visible: true}],
  });

  const columns = await getBoardColumns(page, boardId);
  const noteId = await createNote(page, boardId, {column: columns[0].id, text: "React to me"});
  await createNoteReaction(page, boardId, {note: noteId, reactionType: "💖"});

  await page.goto(`/board/${boardId}`);

  const startColumn = page.getByRole("region", {name: "Start", exact: true});
  const note = startColumn.getByRole("article", {name: "React to me"});
  await expect(note).toBeVisible();

  const reaction = note.getByRole("button", {name: "💖 1"});
  await expect(reaction).toBeVisible();

  const reactionBar = note.getByRole("button", {name: "toggle the reaction bar"});
  await reactionBar.click();
  const selectReaction = page.getByRole("button", {name: "👍"});
  await selectReaction.click();

  await expect(note.getByRole("button", {name: "👍 1"})).toBeVisible();
  await expect(note.getByRole("button", {name: "💖 1"})).not.toBeVisible();
});

test("should remove the reaction from a note", async ({page}) => {
  const name = "remove reaction playwright agent";
  await loginAnonymous(page, name);
  await acceptCookies(page);

  const boardId = await createBoard(page, {
    name: "Board",
    accessPolicy: "PUBLIC",
    columns: [{name: "Start", color: "goal-green", index: 0, visible: true}],
  });

  const columns = await getBoardColumns(page, boardId);
  const noteId = await createNote(page, boardId, {column: columns[0].id, text: "React to me"});
  await createNoteReaction(page, boardId, {note: noteId, reactionType: "💖"});

  await page.goto(`/board/${boardId}`);

  const startColumn = page.getByRole("region", {name: "Start", exact: true});
  const note = startColumn.getByRole("article", {name: "React to me"});
  await expect(note).toBeVisible();

  const reaction = note.getByRole("button", {name: "💖 1"});
  await expect(reaction).toBeVisible();

  await reaction.click();
  await expect(reaction).not.toBeVisible();
});
