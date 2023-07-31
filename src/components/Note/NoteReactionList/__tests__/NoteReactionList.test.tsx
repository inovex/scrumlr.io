import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {NoteReactionList} from "../NoteReactionList";
import {render} from "testUtils";
import {fireEvent} from "@testing-library/react";

const NOTE_ID = "test-notes-id-1";

const createNoteReactionList = (note: string) => (
  <Provider store={getTestStore()}>
    <NoteReactionList noteId={note}></NoteReactionList>
  </Provider>
);

describe("NoteReactionList", () => {
  it("should have two reactions", () => {
    const {container} = render(createNoteReactionList(NOTE_ID));
    const reactionContainer = container.getElementsByClassName("note-reaction-list__reaction-chips-container")[0];
    expect(reactionContainer.children.length).toBe(2);
  });

  it("should show no reactions on clicking sticker", () => {
    const {container} = render(createNoteReactionList(NOTE_ID));
    const stickerContainer = container.getElementsByClassName("note-reaction-list__add-reaction-sticker-container")[0];
    fireEvent.click(stickerContainer);
    const reactionContainer = container.getElementsByClassName("note-reaction-list__reaction-chips-container")[0];
    expect(reactionContainer.children.length).toBe(0); // no reaction are rendered because bar is visible instead.
  });
});
