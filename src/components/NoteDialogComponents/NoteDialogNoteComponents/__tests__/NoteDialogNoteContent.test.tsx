import {render} from "testUtils";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {NoteDialogNoteContent} from "components/NoteDialogComponents/NoteDialogNoteComponents/NoteDialogNoteContent";

vi.mock("utils/hooks/useImageChecker.ts", async () => ({
  useImageChecker: () => false,
}));

describe("NoteDialogNoteContent", () => {
  it("should render the character count in the same row as the edited marker", () => {
    const longText = "a".repeat(1536);
    const editedNote = {...getTestApplicationState().notes[0], text: longText}; // notes[0] is marked as edited
    const viewer = getTestApplicationState().participants.self!;

    const {container} = render(
      <Provider store={getTestStore({notes: [editedNote]})}>
        <NoteDialogNoteContent noteId={editedNote.id} authorId={editedNote.author} text={longText} viewer={viewer} isStackedNote={false} />
      </Provider>
    );

    const textarea = container.querySelector<HTMLTextAreaElement>(".note-dialog__note-content-text")!;
    expect(textarea).toBeTruthy();

    const footer = textarea.nextElementSibling!;
    expect(footer).toHaveClass("note-dialog__note-content-footer");
    expect(footer.querySelector(".note-dialog__marker-edited")).toBeTruthy();
    expect(footer.querySelector(".character-count-indicator")).toHaveTextContent("1536/2048");
  });
});
