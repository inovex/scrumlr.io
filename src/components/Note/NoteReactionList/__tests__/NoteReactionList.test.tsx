import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {NoteReactionList} from "../NoteReactionList";
import {render} from "testUtils";

const NOTE_ID = "test-notes-id-1";

const createNoteReactionList = (note: string) => (
  <Provider store={getTestStore()}>
    <NoteReactionList noteId={note}></NoteReactionList>
  </Provider>
);

describe("NoteReactionList", () => {
  describe("data", () => {
    it("should have two reactions", () => {
      const {container} = render(createNoteReactionList(NOTE_ID));
      const reactionContainer = container.getElementsByClassName("note-reaction-list__reaction-chips-container")[0];
      expect(reactionContainer.children.length).toBe(2);
    });
  });
});
