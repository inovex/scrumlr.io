import {test, expect} from "@playwright/test";
import { noteTest } from "@fixtures/notes";
import {acceptCookies, createBoard, createNote, createNoteReaction, getBoardColumns, loginAnonymous, updateNote} from "@helpers/api";

test.describe("testing notes", () => {
  test.describe.configure({mode: "parallel"});

  noteTest("should create a note", async ({page, note}) => {
    await page.goto(`/board/${note.boardId}`);

    const startColumn = page.getByRole("region", {name: "Start", exact: true});
    const noteTextBox = startColumn.getByRole("textbox", {name: "Add your note..."});
    await noteTextBox.fill("Test note");

    const create = startColumn.getByRole("button", {name: "Create note"});
    await create.click();

    const selectedNote = startColumn.getByRole("article", {name: "Test note"});
    await expect(selectedNote).toBeVisible();
  });

  noteTest("should edit a note", async ({page, note}) => {
    await createNote(page, note.boardId, {column: note.columns[0].id, text: "Test note"});

    await page.goto(`/board/${note.boardId}`);

    const startColumn = page.getByRole("region", {name: "Start", exact: true});
    const selectedNote = startColumn.getByRole("article", {name: "Test note"});
    await selectedNote.click();

    const editInput = page.getByRole("textbox", {name: "Edit note"});
    await expect(editInput).toHaveValue("Test note");
    await editInput.fill("Edited note");

    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");

    const editedNote = startColumn.getByRole("article", {name: "Edited note"});
    await expect(editedNote).toBeVisible();
    await expect(selectedNote).not.toBeVisible();
  });

  noteTest("should delete a note", async ({page, note}) => {
    await createNote(page, note.boardId, {column: note.columns[0].id, text: "Test note"});

    await page.goto(`/board/${note.boardId}`);

    const startColumn = page.getByRole("region", {name: "Start", exact: true});
    const selectedNote = startColumn.getByRole("article", {name: "Test note"});
    await selectedNote.click();

    const deleteNote = page.getByRole("button", {name: "Delete this note"});
    await deleteNote.click();

    const submit = page.getByRole("button", {name: "Delete Note"});
    await submit.click();

    await expect(selectedNote).not.toBeVisible();
  });

  noteTest("should move a note to another column", async ({page, note}) => {
    await createNote(page, note.boardId, {column: note.columns[0].id, text: "Move me"});

    await page.goto(`/board/${note.boardId}`);

    const startcolumn = page.getByRole("region", {name: "Start", exact: true});
    const stopColumn = page.getByRole("region", {name: "Stop", exact: true});

    const selectedNote = startcolumn.getByRole("article", {name: "Move me"});
    await expect(selectedNote).toBeVisible();

    await selectedNote.dragTo(stopColumn, {steps: 20});

    await expect(stopColumn.getByRole("article", {name: "Move me"})).toBeVisible();
    await expect(startcolumn.getByRole("article", {name: "Move me"})).not.toBeVisible();
  });

  noteTest("should stack two notes", async ({page, note}) => {
    await createNote(page, note.boardId, {column: note.columns[0].id, text: "Note 1"});
    await createNote(page, note.boardId, {column: note.columns[0].id, text: "Note 2"});

    await page.goto(`/board/${note.boardId}`);

    const startColumn = page.getByRole("region", {name: "Start", exact: true});

    const note1 = startColumn.getByRole("article", {name: "Note 1"});
    await expect(note1).toBeVisible();

    const note2 = startColumn.getByRole("article", {name: "Note 2"});
    await expect(note2).toBeVisible();

    const target = await note1.boundingBox();

    await note2.dragTo(note1, {steps: 20, targetPosition: {x: target!.width / 2, y: 0}});

    await expect(startColumn.getByRole("article")).toHaveCount(1);
  });

  noteTest("should unstack two notes", async ({page, note}) => {
    const note1Id = await createNote(page, note.boardId, {column: note.columns[0].id, text: "Note 1"});
    const note2Id = await createNote(page, note.boardId, {column: note.columns[0].id, text: "Note 2"});
    await updateNote(page, note.boardId, note2Id, {position: {column: note.columns[0].id, stack: note1Id, rank: 1}});

    await page.goto(`/board/${note.boardId}`);

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

  noteTest("should react to a note", async ({page, note}) => {
    await createNote(page, note.boardId, {column: note.columns[0].id, text: "React to me"});

    await page.goto(`/board/${note.boardId}`);

    const startColumn = page.getByRole("region", {name: "Start", exact: true});
    const selectedNote = startColumn.getByRole("article", {name: "React to me"});
    await expect(selectedNote).toBeVisible();

    const reactionBar = selectedNote.getByRole("button", {name: "toggle the reaction bar"});
    await reactionBar.click();
    const reaction = page.getByRole("button", {name: "💖"});
    await reaction.click();

    const noteReaction = selectedNote.getByRole("button", {name: "💖 1"});
    await expect(noteReaction).toBeVisible();
  });

  noteTest("should change the reaction on a note", async ({page, note}) => {
    const noteId = await createNote(page, note.boardId, {column: note.columns[0].id, text: "React to me"});
    await createNoteReaction(page, note.boardId, {note: noteId, reactionType: "💖"});

    await page.goto(`/board/${note.boardId}`);

    const startColumn = page.getByRole("region", {name: "Start", exact: true});
    const selectedNote = startColumn.getByRole("article", {name: "React to me"});
    await expect(selectedNote).toBeVisible();

    const reaction = selectedNote.getByRole("button", {name: "💖 1"});
    await expect(reaction).toBeVisible();

    const reactionBar = selectedNote.getByRole("button", {name: "toggle the reaction bar"});
    await reactionBar.click();
    const selectReaction = page.getByRole("button", {name: "👍"});
    await selectReaction.click();

    await expect(selectedNote.getByRole("button", {name: "👍 1"})).toBeVisible();
    await expect(selectedNote.getByRole("button", {name: "💖 1"})).not.toBeVisible();
  });

  noteTest("should remove the reaction from a note", async ({page, note}) => {
    const noteId = await createNote(page, note.boardId, {column: note.columns[0].id, text: "React to me"});
    await createNoteReaction(page, note.boardId, {note: noteId, reactionType: "💖"});

    await page.goto(`/board/${note.boardId}`);

    const startColumn = page.getByRole("region", {name: "Start", exact: true});
    const selectedNote = startColumn.getByRole("article", {name: "React to me"});
    await expect(selectedNote).toBeVisible();

    const reaction = selectedNote.getByRole("button", {name: "💖 1"});
    await expect(reaction).toBeVisible();

    await reaction.click();
    await expect(reaction).not.toBeVisible();
  });
});
