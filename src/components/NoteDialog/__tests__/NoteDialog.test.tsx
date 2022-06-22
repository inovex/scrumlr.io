import {fireEvent, waitFor} from "@testing-library/react";
import {Provider} from "react-redux";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import {NoteDialog} from "components/NoteDialog";
import {Actions} from "store/action";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import getTestParticipant from "utils/test/getTestParticipant";
import * as redux from "react-redux";

type NoteDialogTestProps = {
  text?: string;
  authorId?: string;
  showAuthors?: boolean;
  activeModeration?: {userId: string; status: boolean};
  currentUserIsModerator?: boolean;
};

const createNoteDialog = (
  {text = "Test Text", authorId = "Test Author", showAuthors = true, currentUserIsModerator = false}: NoteDialogTestProps = {
    text: "Test Text",
    authorId: "Test Author",
    showAuthors: true,
    activeModeration: {userId: "Test Author", status: false},
    currentUserIsModerator: false,
  }
) => {
  const [NoteDialogContext] = wrapWithTestBackend(NoteDialog);
  return (
    <Provider store={getTestStore()}>
      <NoteDialogContext
        noteId="0"
        text={text}
        authorId={authorId}
        columnName=""
        columnColor=""
        show
        activeVoting
        authorName=""
        showAuthors={showAuthors}
        votes={1}
        allVotesOfUser={[]}
        childrenNotes={[
          {id: "1", text: "", author: "", authorName: "", position: {column: "test-column", stack: "0", rank: 0}, votes: 0},
          {id: "2", text: "", author: "", authorName: "", position: {column: "test-column", stack: "0", rank: 1}, votes: 0},
        ]}
        onClose={() => {}}
        onDeleteOfParent={() => {}}
        viewer={getTestParticipant(currentUserIsModerator ? {role: "MODERATOR"} : {role: "PARTICIPANT"})}
      />
    </Provider>
  );
};

describe("<NoteDialog/>", () => {
  beforeEach(() => {
    window.IntersectionObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        } as unknown as IntersectionObserver)
    );

    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
  });

  describe("should render correctly", () => {
    test("note-dialog is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".portal__content")?.firstChild).toHaveClass("note-dialog");
    });

    test("note-dialog__note-header is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog")?.firstChild).toHaveClass("note-dialog__header");
    });

    test("three note-dialog__note present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
      expect(noteDialogNotes.length).toEqual(3);
    });

    test("note-dialog__note one is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
      expect(noteDialogNotes[0]).toHaveClass("note-dialog__note");
    });

    test("note-dialog__note two is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
      expect(noteDialogNotes[1]).toHaveClass("note-dialog__note");
    });

    test("note-dialog__note three is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
      expect(noteDialogNotes[2]).toHaveClass("note-dialog__note");
    });

    test("note-dialog__note-options note two is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
      expect(noteDialogNotes[1].querySelector(".note-dialog__options")).toBeDefined();
    });

    test("note-dialog__note-options note three is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
      expect(noteDialogNotes[2].querySelector(".note-dialog__options")).toBeDefined();
    });

    describe("NoteDialogNoteContent", () => {
      test("note-dialog__note-content is present", () => {
        const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
        expect(container.querySelector(".note-dialog__note")!.querySelector(".note-dialog__note-content")).toBeDefined();
      });

      test("click on NoteContent as author", async () => {
        const useDispatchSpy = jest.spyOn(redux, "useDispatch");
        const mockDispatchFn = jest.fn();
        useDispatchSpy.mockReturnValue(mockDispatchFn);
        const {container} = render(createNoteDialog({authorId: "test-participant-id"}), {container: global.document.querySelector("#portal")!});
        const noteContentText = container.querySelector(".note-dialog__note-content__text")!;
        fireEvent.blur(noteContentText, {target: {value: "Changed Text"}});

        await waitFor(() => {
          expect(mockDispatchFn).toHaveBeenCalledWith(Actions.editNote("0", {text: "Changed Text"}));
        });
      });

      test("click on NoteContent as moderator", async () => {
        const useDispatchSpy = jest.spyOn(redux, "useDispatch");
        const mockDispatchFn = jest.fn();
        useDispatchSpy.mockReturnValue(mockDispatchFn);
        const {container} = render(createNoteDialog({currentUserIsModerator: true}), {container: global.document.querySelector("#portal")!});
        const noteContentText = container.querySelector(".note-dialog__note-content__text")!;
        fireEvent.blur(noteContentText, {target: {value: "Changed Text"}});

        await waitFor(() => {
          expect(mockDispatchFn).toHaveBeenCalledWith(Actions.editNote("0", {text: "Changed Text"}));
        });
      });

      test("click on NoteContent as other user", async () => {
        const useDispatchSpy = jest.spyOn(redux, "useDispatch");
        const mockDispatchFn = jest.fn();
        useDispatchSpy.mockReturnValue(mockDispatchFn);
        const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
        const noteContentText = container.querySelector(".note-dialog__note-content__text")!;
        fireEvent.blur(noteContentText, {target: {textContent: "Changed Text"}});

        await waitFor(() => {
          expect(mockDispatchFn).not.toHaveBeenCalled();
        });
      });
    });

    test("note-dialog__note-footer is present", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog__note")!.querySelector(".note-dialog__note-footer")).toBeDefined();
    });

    test("note-dialog match snapshot", () => {
      const {container} = render(createNoteDialog(), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".note-dialog")).toMatchSnapshot();
    });

    // describe("Moderation phase", () => {
    //   test("three note-dialog__note present during moderation phase", () => {
    //     const {container} = render(createNoteDialog({activeModeration: {userId: "test-user-1", status: true}, authorId: "test-user-1"}), {
    //       container: global.document.querySelector("#portal")!,
    //     });
    //     const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
    //     expect(noteDialogNotes.length).toEqual(3);
    //   });
    //
    //   test("moderation: last note-dialog__options note isn't present", () => {
    //     const {container} = render(createNoteDialog({activeModeration: {userId: "test-user-1", status: true}, authorId: "test-user-1"}), {
    //       container: global.document.querySelector("#portal")!,
    //     });
    //     const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
    //     expect(noteDialogNotes[noteDialogNotes.length - 1].children.length).toEqual(2);
    //     expect(noteDialogNotes[noteDialogNotes.length - 1].querySelector(".note-dialog__note-content")).not.toBeNull();
    //     expect(noteDialogNotes[noteDialogNotes.length - 1].querySelector(".note-dialog__note-footer")).not.toBeNull();
    //     expect(noteDialogNotes[noteDialogNotes.length - 1].querySelector(".note-dialog__note-options")).toBeNull();
    //   });
    //
    //   test("moderation: last note-dialog__notes has two children", () => {
    //     const {container} = render(createNoteDialog({activeModeration: {userId: "test-user-1", status: true}, authorId: "test-user-1"}), {
    //       container: global.document.querySelector("#portal")!,
    //     });
    //     const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
    //     expect(noteDialogNotes[noteDialogNotes.length - 1].children.length).toEqual(2);
    //   });
    //
    //   test("moderation: last note-dialog__options note is present", () => {
    //     const {container} = render(createNoteDialog({activeModeration: {userId: "test-user-1", status: true}, authorId: "test-user-1", currentUserIsModerator: true}), {
    //       container: global.document.querySelector("#portal")!,
    //     });
    //     const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
    //     expect(noteDialogNotes[noteDialogNotes.length - 1].querySelector(".note-dialog__note-content")).not.toBeNull();
    //     expect(noteDialogNotes[noteDialogNotes.length - 1].querySelector(".note-dialog__note-footer")).not.toBeNull();
    //     expect(noteDialogNotes[noteDialogNotes.length - 1].querySelector(".note-dialog__note-options")).not.toBeNull();
    //   });
    //
    //   test("moderation: last note-dialog__notes has three children", () => {
    //     const {container} = render(createNoteDialog({activeModeration: {userId: "test-user-1", status: true}, authorId: "test-user-1", currentUserIsModerator: true}), {
    //       container: global.document.querySelector("#portal")!,
    //     });
    //     const noteDialogNotes = container.querySelectorAll(".note-dialog__note");
    //     expect(noteDialogNotes[noteDialogNotes.length - 1].children.length).toEqual(2);
    //   });
    // });
  });
});
