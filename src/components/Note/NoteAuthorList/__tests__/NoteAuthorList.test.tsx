import {ApplicationState} from "types";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {NoteAuthorList} from "../NoteAuthorList";
import {Participant, ParticipantExtendedInfo} from "types/participant";
import {render} from "testUtils";
import getTestParticipant from "../../../../utils/test/getTestParticipant";

const AUTHOR1: ParticipantExtendedInfo = {...getTestParticipant({user: {id: "test-participant-id-1", name: "test-participant-name-1"}}), isSelf: true, displayName: "Me"};
const AUTHOR2: ParticipantExtendedInfo = {...getTestParticipant({user: {id: "test-participant-id-2", name: "test-participant-name-2"}}), isSelf: false, displayName: "test-user-2"};
const AUTHOR3: ParticipantExtendedInfo = {...getTestParticipant({user: {id: "test-participant-id-3", name: "test-participant-name-3"}}), isSelf: false, displayName: "test-user-3"};
const AUTHOR4: ParticipantExtendedInfo = {...getTestParticipant({user: {id: "test-participant-id-4", name: "test-participant-name-4"}}), isSelf: false, displayName: "test-user-4"};
const VIEWER1: Participant = getTestParticipant({user: {id: "test-participant-id-1", name: "test-participant-name-1"}});

const createNoteAuthorList = (authors: ParticipantExtendedInfo[], showAuthors: boolean, overwrite?: Partial<ApplicationState>) => {
  return (
    <Provider store={getTestStore(overwrite)}>
      <NoteAuthorList authors={authors} showAuthors={showAuthors} viewer={VIEWER1} />
    </Provider>
  );
};

describe("NoteAuthorList", () => {
  describe("display", () => {
    it("should not display since it's deactivated", () => {
      const {container} = render(createNoteAuthorList([AUTHOR3], false));
      expect(container.querySelector(".note-author-list")).toBeNull();
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
      expect(container.firstChild).toHaveClass("note-author-list--self");
    });

    it("should not have a rest bubble", () => {
      const {container} = render(createNoteAuthorList([AUTHOR1, AUTHOR2, AUTHOR3], true));
      expect(container.querySelector(".note-author-rest")).toBeNull();
    });

    it("should have a rest bubble after exceeding 3 authors", () => {
      const {container} = render(createNoteAuthorList([AUTHOR1, AUTHOR2, AUTHOR3, AUTHOR4], true));
      expect(container.querySelector(".note-author-rest")).not.toBeNull();
    });
  });
});
