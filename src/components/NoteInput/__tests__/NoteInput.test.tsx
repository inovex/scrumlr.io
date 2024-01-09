import {fireEvent, render} from "@testing-library/react";
import {NoteInput} from "components/NoteInput";
import {I18nextProvider} from "react-i18next";
import i18nTest from "i18nTest";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";

const createNoteInput = (columnId: string, maxNoteLength: number) => (
  <I18nextProvider i18n={i18nTest}>
    <Provider store={getTestStore()}>
      <NoteInput columnId={columnId} maxNoteLength={maxNoteLength} columnIndex={1} columnIsVisible toggleColumnVisibility={() => undefined} />
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
    const {container} = render(createNoteInput("TestID", 1024));
    expect(container.firstChild).toMatchSnapshot();
  });

  test("note length", () => {
    const {container} = render(createNoteInput("TestID", 5));

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
});
