import React from "react";
import {render} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";
import Note from "./Note";

const mockStore = configureStore();

const createNote = (text: string, authorId: string) => {
  const initialState = {
    board: {
      data: {
        columns: [{id: "TestID", name: "Testheader", hidden: false}],
      },
    },
    notes: [],
    users: {
      admins: [],
      basic: [],
      all: [],
    },
  };
  const store = mockStore(initialState);
  return (
    <Provider store={store}>
      <Note text={text} authorId={authorId} />
    </Provider>
  );
};

describe("Note", () => {
  beforeEach(() => {
    window.IntersectionObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        } as unknown as IntersectionObserver)
    );
  });

  describe("should render correctly", () => {
    test("note is present", () => {
      const {container} = render(createNote("Test Text", "Test Author"));
      expect(container.firstChild).toHaveClass("note");
    });

    test("note content is present", () => {
      const {container} = render(createNote("Test Text", "Test Author"));
      expect(container.querySelector(".note").firstChild).toHaveClass("note__content");
    });

    test("note text is present", () => {
      const {container} = render(createNote("Test Text", "Test Author"));
      expect(container.querySelector(".note__content").firstChild).toHaveClass("note__text");
    });

    test("note text has correct text", () => {
      const {container} = render(createNote("Test Text", "Test Author"));
      expect(container.firstChild).toHaveTextContent("Test Text");
    });

    test("note footer is present", () => {
      const {container} = render(createNote("Test Text", "Test Author"));
      expect(container.querySelector(".note").lastChild).toHaveClass("note__footer");
    });

    test("note author is present", () => {
      const {container} = render(createNote("Test Text", "Test Author"));
      expect(container.querySelector(".note__footer").firstChild).toHaveClass("note__author");
    });

    test("note author image is present", () => {
      const {container} = render(createNote("Test Text", "Test Author"));
      expect(container.querySelector(".note__author").firstChild).toHaveClass("note__author-image");
    });

    test("note author name is present", () => {
      const {container} = render(createNote("Test Text", "Test Author"));
      expect(container.querySelector(".note__author").lastChild).toHaveClass("note__author-name");
    });
  });

  describe("should have correct style", () => {
    test("show note with correct style", () => {
      const {container} = render(createNote("Test Text", "Test Author"));
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
