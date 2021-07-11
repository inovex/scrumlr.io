import React from "react";
import {render} from "@testing-library/react";
import NoteInput from "components/NoteInput/NoteInput";

const createNoteInput = (columnId) => <NoteInput columnId={columnId} />;

describe("Note Input", () => {
  beforeEach(() => {
    window.IntersectionObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        } as any)
    );
  });

  describe("should render correctly", () => {
    test("noteinput is present", () => {
      const {container} = render(createNoteInput("TestID"));
      expect(container.firstChild).toHaveClass("MuiInputBase-root MuiFilledInput-root NoteInput-root-1 MuiFilledInput-underline MuiInputBase-adornedEnd MuiFilledInput-adornedEnd");
    });
  });

  describe("should have correct style", () => {
    test("show noteinput with correct style", () => {
      const {container} = render(createNoteInput("TestID"));
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
