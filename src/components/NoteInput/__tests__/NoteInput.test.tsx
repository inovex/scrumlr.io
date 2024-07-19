import {fireEvent, render, screen} from "@testing-library/react";
import {NoteInput} from "components/NoteInput";
import {I18nextProvider} from "react-i18next";
import i18nTest from "i18nTest";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import i18n from "i18nTest";
import getTestParticipant from "utils/test/getTestParticipant";

jest.mock("utils/hooks/useImageChecker.ts", () => ({
  useImageChecker: () => false,
}));

const createNoteInput = (columnId: string) => (
  <I18nextProvider i18n={i18nTest}>
    <Provider store={getTestStore()}>
      <NoteInput columnId={columnId} columnIndex={1} columnIsVisible toggleColumnVisibility={() => undefined} />
    </Provider>
  </I18nextProvider>
);

describe("Note Input", () => {
  beforeEach(() => {
    window.IntersectionObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        }) as unknown as IntersectionObserver
    );
  });

  test("should render correctly", () => {
    const {container} = render(createNoteInput("TestID"));
    expect(container.firstChild).toMatchSnapshot();
  });

  test("note length", () => {
    const {container} = render(createNoteInput("TestID"));

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

  it("should be disabled if the board is locked and the client is participant", () => {
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
        focusInitiator: null,
      },
    });
    render(
      <I18nextProvider i18n={i18nTest}>
        <Provider store={store}>
          <NoteInput columnId="test-colum-id" columnIndex={1} columnIsVisible toggleColumnVisibility={() => undefined} />
        </Provider>
      </I18nextProvider>
    );
    expect(screen.queryByPlaceholderText(i18n.t("NoteInput.placeholder"))).toBeDisabled();
    expect(screen.queryByTitle(i18n.t("NoteInput.create"))).toBeDisabled();
  });

  it("should not be disabled if the board is locked and the client is moderator", () => {
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
        focusInitiator: null,
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
