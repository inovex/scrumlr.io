import {fireEvent, render} from "testUtils";
import {NoteInput} from "components/NoteInput";
import store from "store";
import {ActionFactory} from "store/action";

const createNoteInput = (columnId: string, maxNoteLength: number) => <NoteInput columnId={columnId} maxNoteLength={maxNoteLength} />;

jest.mock("store", () => ({
  ...jest.requireActual("store"),
  dispatch: jest.fn(),
}));

describe("Note Input", () => {
  beforeEach(() => {
    window.IntersectionObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        } as unknown as IntersectionObserver)
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
    expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.addNote("TestID", "1234"));

    // Exact works as expected
    fireEvent.change(container.querySelector(".note-input__input")!, {target: {value: "12345"}});
    fireEvent.keyDown(container.querySelector(".note-input__input")!, {key: "Enter", code: "Enter", charCode: 13});
    expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.addNote("TestID", "12345"));

    // More than the limit works as expected
    fireEvent.change(container.querySelector(".note-input__input")!, {target: {value: "123456"}});
    fireEvent.keyDown(container.querySelector(".note-input__input")!, {key: "Enter", code: "Enter", charCode: 13});
    expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.addNote("TestID", "12345"));
  });
});
