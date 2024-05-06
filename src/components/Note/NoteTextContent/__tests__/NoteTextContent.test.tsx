import {NoteTextContent} from "../NoteTextContent";
import {render} from "testUtils";

describe("NoteTextContent", () => {
  it("should render correctly", () => {
    const testText = "hello https://scrumlr.io";
    const noteTextContent = render(<NoteTextContent text={testText} />);

    expect(noteTextContent.container).toMatchSnapshot();
  });

  it("should convert a plain URL to a clickable link", () => {
    const testText = "hello https://scrumlr.io";
    const noteTextContent = render(<NoteTextContent text={testText} />);

    expect(noteTextContent.container.getElementsByTagName("a")).toHaveLength(1);
  });

  it("should add a protocol for links without one", () => {
    const testText = "hello scrumlr.io";
    const noteTextContent = render(<NoteTextContent text={testText} />);
    const anchor = noteTextContent.container.getElementsByTagName("a")[0];

    expect(anchor).toHaveAttribute("href", expect.stringContaining("https://"));
  });

  it("should not add the truncated class if not defined", () => {
    const testText = "hello scrumlr.io";
    const noteTextContent = render(<NoteTextContent text={testText} />);
    const anchor = noteTextContent.container.getElementsByTagName("a")[0];

    expect(anchor).not.toHaveClass("note-text-content-url--truncate");
  });

  it("should add the truncated class if set to true", () => {
    const testText = "hello scrumlr.io";
    const noteTextContent = render(<NoteTextContent text={testText} truncate />);
    const anchor = noteTextContent.container.getElementsByTagName("a")[0];

    expect(anchor).toHaveClass("note-text-content-url--truncate");
  });
});
