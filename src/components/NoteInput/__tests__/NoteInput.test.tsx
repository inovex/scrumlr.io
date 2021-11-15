import {render} from "testUtils";
import {NoteInput} from "components/NoteInput";

const createNoteInput = (columnId: string) => <NoteInput columnId={columnId} />;

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
    const {container} = render(createNoteInput("TestID"));
    expect(container.firstChild).toMatchSnapshot();
  });
});
