import {ApplicationState} from "types";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {NoteAuthorList} from "../NoteAuthorList";
import {Participant} from "types/participant";
import {render} from "testUtils";
import getTestParticipant from "utils/test/getTestParticipant";

const AUTHOR1: Participant = getTestParticipant({user: {id: "test-participant-id-1", name: "test-participant-name-1"}});
const AUTHOR2: Participant = getTestParticipant({user: {id: "test-participant-id-2", name: "test-participant-name-2"}});
const AUTHOR3: Participant = getTestParticipant({user: {id: "test-participant-id-3", name: "test-participant-name-3"}});
const AUTHOR4: Participant = getTestParticipant({user: {id: "test-participant-id-4", name: "test-participant-name-4"}});
const AUTHOR5: Participant = getTestParticipant({user: {id: "test-participant-id-5", name: "test-participant-name-5"}});
const VIEWER1: Participant = getTestParticipant({user: {id: "test-participant-id-1", name: "test-participant-name-1"}});

const createNoteAuthorList = (authors: Participant[], showAuthors: boolean, overwrite?: Partial<ApplicationState>) => {
  return (
    <Provider store={getTestStore(overwrite)}>
      <NoteAuthorList authors={authors} showAuthors={showAuthors} viewer={VIEWER1} />
    </Provider>
  );
};

describe("NoteAuthorList", () => {
  describe("display", () => {
    it("should display a skeleton when disabled", () => {
      const {container} = render(createNoteAuthorList([AUTHOR3], false));
      expect(container.querySelector(".note-author-list")).toBeNull();
      expect(container.querySelector(".note-author-skeleton")).not.toBeNull();
    });

    it("should display a skeleton when no author is specified", () => {
      const {container} = render(createNoteAuthorList([], true));
      expect(container.querySelector(".note-author-list")).toBeNull();
      expect(container.querySelector(".note-author-skeleton")).not.toBeNull();
    });

    it("should display even when deactivated when viewer equals note author", () => {
      const {container} = render(createNoteAuthorList([AUTHOR1], false));
      expect(container.querySelector(".note-author-list")).not.toBeNull();
    });
  });

  describe("different authors", () => {
    it("should display one author", () => {
      const {container} = render(createNoteAuthorList([AUTHOR1], true));
      expect(container.getElementsByClassName("note__author").length).toBe(1);
    });

    it("should have self class for self", () => {
      const {container} = render(createNoteAuthorList([AUTHOR1], true));
      expect(container.getElementsByClassName("note-author__container")[0]).toHaveClass("note-author__container--self");
    });

    it("should contain Me as name", () => {
      const {container} = render(createNoteAuthorList([AUTHOR1], true));
      expect(container.firstChild).toHaveTextContent("Me");
    });

    it("should contain author 2s name", () => {
      const {container} = render(createNoteAuthorList([AUTHOR2], true));
      expect(container.firstChild).not.toHaveTextContent(AUTHOR1.user.name);
      expect(container.firstChild).toHaveTextContent(AUTHOR2.user.name);
    });

    it("should not have a rest bubble", () => {
      const {container} = render(createNoteAuthorList([AUTHOR1, AUTHOR2, AUTHOR3], true));
      expect(container.querySelector(".note-author-rest")).toBeNull();
    });

    it("should have a rest bubble after exceeding 4 authors", () => {
      const {container} = render(createNoteAuthorList([AUTHOR1, AUTHOR2, AUTHOR3, AUTHOR4, AUTHOR5], true));
      expect(container.querySelector(".note-author-rest")).not.toBeNull();
    });
  });
});
