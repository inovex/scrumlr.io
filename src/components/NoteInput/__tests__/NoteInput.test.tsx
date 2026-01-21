import {fireEvent, render, screen} from "@testing-library/react";
import {NoteInput} from "components/NoteInput";
import {I18nextProvider} from "react-i18next";
import i18nTest from "i18nTest";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import i18n from "i18nTest";
import getTestParticipant from "utils/test/getTestParticipant";

vi.mock("utils/hooks/useImageChecker.ts", () => ({
  useImageChecker: () => false,
}));

const createNoteInput = (columnId: string) => {
  const store = getTestStore();
  const column = store.getState().columns.find((c) => c.id === columnId)!;
  return render(
    <I18nextProvider i18n={i18nTest}>
      <Provider store={store}>
        <NoteInput column={column} />
      </Provider>
    </I18nextProvider>
  );
};

describe("Note Input", () => {
  beforeEach(() => {
    window.IntersectionObserver = vi.fn(
      () =>
        ({
          observe: vi.fn(),
          disconnect: vi.fn(),
        }) as unknown as IntersectionObserver
    );
  });

  test("should render correctly", () => {
    const {container} = createNoteInput("test-columns-id-1");
    expect(container.firstChild).toMatchSnapshot();
  });

  test("note length", () => {
    const {container} = createNoteInput("test-columns-id-1");

    // less works as expected
    fireEvent.change(container.querySelector(".note-input__input")!, {target: {value: "1234"}});
    fireEvent.keyDown(container.querySelector(".note-input__input")!, {key: "Enter", code: "Enter", charCode: 13});

    // Exact works as expected
    fireEvent.change(container.querySelector(".note-input__input")!, {target: {value: "12345"}});
    fireEvent.keyDown(container.querySelector(".note-input__input")!, {key: "Enter", code: "Enter", charCode: 13});

    // More than the limit works as expected
    fireEvent.change(container.querySelector(".note-input__input")!, {target: {value: "123456"}});
    fireEvent.keyDown(container.querySelector(".note-input__input")!, {key: "Enter", code: "Enter", charCode: 13});
  });

  // why is this so over-complicated and weird?? TODO fix this mess
  it.skip("should be disabled if the board is locked and the client is participant", () => {
    const store = getTestStore({
      board: {
        status: "ready",
        data: {
          id: "test-board-id",
          name: "test-board-name",
          accessPolicy: "PUBLIC",
          showAuthors: true,
          showNotesOfOtherUsers: true,
          showNoteReactions: true,
          allowStacking: true,
          isLocked: true,
        },
      },
      participants: {
        self: getTestParticipant({role: "PARTICIPANT"}),
        others: [],
      },
    });

    const {container} = createNoteInput("test-columns-id-1");
    // expect(container.get(i18n.t("NoteInput.placeholder"))).toBeDisabled();
    // expect(container.queryByTitle(i18n.t("NoteInput.create"))).toBeDisabled();
  });

  // same here, I don't understand at all why you would do this
  it.skip("should not be disabled if the board is locked and the client is moderator", () => {
    const store = getTestStore({
      board: {
        status: "ready",
        data: {
          id: "test-board-id",
          name: "test-board-name",
          accessPolicy: "PUBLIC",
          showAuthors: true,
          showNotesOfOtherUsers: true,
          showNoteReactions: true,
          allowStacking: true,
          isLocked: true,
        },
      },
      participants: {
        self: getTestParticipant({role: "MODERATOR"}),
        others: [],
      },
    });
    render(
      <I18nextProvider i18n={i18nTest}>
        <Provider store={store}>
          <NoteInput columnId="test-colum-id" columnIndex={1} columnIsVisible toggleColumnVisibility={() => undefined} />
        </Provider>
      </I18nextProvider>
    );
    expect(screen.queryByPlaceholderText(i18n.t("NoteInput.placeholder"))).not.toBeDisabled();
    expect(screen.queryByTitle(i18n.t("NoteInput.create"))).not.toBeDisabled();
  });
});
