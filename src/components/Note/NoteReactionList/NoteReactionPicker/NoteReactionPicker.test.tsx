import {fireEvent, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {PERMANENT_EMOJIS} from "store/features/reactions/types";
import {Provider} from "react-redux";
import {ApplicationState} from "store";
import getTestStore from "utils/test/getTestStore";
import {MemoryRouter} from "react-router";
import {NoteReactionPicker} from "./NoteReactionPicker";

// Mock EmojiPicker to avoid database initialization issues during tests
 vi.mock("../EmojiPicker/EmojiPicker", () => ({
  __esModule: true,
  default: () => <div data-testid="emoji-picker-mock" />,
}));

const renderNoteReactionPicker = (close?: () => void, click?: () => void, overwrite?: Partial<ApplicationState>) =>
  render(
    <Provider store={getTestStore(overwrite)}>
      <MemoryRouter>
        <NoteReactionPicker closeReactionBar={close ?? vi.fn()} reactions={[]} handleClickReaction={click ?? vi.fn()} />
      </MemoryRouter>
    </Provider>
  );

describe("NoteReactionPicker", () => {
  it("renders the permanent reaction buttons correctly", () => {
    renderNoteReactionPicker();
    PERMANENT_EMOJIS.forEach((emoji) => {
      expect(screen.getByText(emoji.reactionType)).toBeInTheDocument();
    });
  });

  it("renders the more emojis button", () => {
    renderNoteReactionPicker();
    expect(screen.getByRole("button", {name: "More emojis"})).toBeInTheDocument();
  });

  it("calls handleClickReaction when a reaction button is clicked", () => {
    const handleClickReactionFunction = vi.fn();
    renderNoteReactionPicker(undefined, handleClickReactionFunction);
    fireEvent.click(screen.getByText(PERMANENT_EMOJIS[0].reactionType));
    expect(handleClickReactionFunction).toHaveBeenCalled();
  });

  it("closes the reaction bar when Escape key is pressed and picker is not open", () => {
    const closeReactionBarFunction = vi.fn();
    renderNoteReactionPicker(closeReactionBarFunction);
    fireEvent.keyDown(document, {key: "Escape"});
    expect(closeReactionBarFunction).toHaveBeenCalled();
  });

  it("closes only the emoji picker when Escape is pressed and picker is open", async () => {
    const closeReactionBarFunction = vi.fn();
    renderNoteReactionPicker(closeReactionBarFunction);

    const moreButton = screen.getByRole("button", {name: "More emojis"});
    await userEvent.click(moreButton);

    expect(screen.getByRole("dialog", {name: "Emoji picker"})).toBeInTheDocument();

    fireEvent.keyDown(document, {key: "Escape"});
    expect(closeReactionBarFunction).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog", {name: "Emoji picker"})).not.toBeInTheDocument();
  });

  it("opens emoji picker when more button is clicked", async () => {
    renderNoteReactionPicker();
    const moreButton = screen.getByRole("button", {name: "More emojis"});

    await userEvent.click(moreButton);

    expect(screen.getByRole("dialog", {name: "Emoji picker"})).toBeInTheDocument();
  });

  it("closes emoji picker when more button is clicked again", async () => {
    renderNoteReactionPicker();
    const moreButton = screen.getByRole("button", {name: "More emojis"});

    await userEvent.click(moreButton);
    expect(screen.getByRole("dialog", {name: "Emoji picker"})).toBeInTheDocument();

    await userEvent.click(moreButton);
    expect(screen.queryByRole("dialog", {name: "Emoji picker"})).not.toBeInTheDocument();
  });

  it("renders recent emojis from store", () => {
    const recentEmojis = [{reactionType: "🎉"}, {reactionType: "🔥"}];
    renderNoteReactionPicker(undefined, undefined, {
      recentEmojis: {emojis: recentEmojis},
    });

    recentEmojis.forEach((emoji) => {
      expect(screen.getByText(emoji.reactionType)).toBeInTheDocument();
    });
  });

  it("shows active state for reactions the user has made", () => {
    const reactions = [
      {
        reactionType: PERMANENT_EMOJIS[0].reactionType,
        myReactionId: "123",
        amount: 1,
        users: [],
        noteId: "note-1",
      },
    ];
    render(
      <Provider store={getTestStore()}>
        <MemoryRouter>
          <NoteReactionPicker closeReactionBar={vi.fn()} reactions={reactions} handleClickReaction={vi.fn()} />
        </MemoryRouter>
      </Provider>
    );

    const activeButton = screen.getByText(PERMANENT_EMOJIS[0].reactionType);
    expect(activeButton).toHaveClass("note-reaction-picker__reaction--active");
  });

  it("closes reaction bar after emoji is clicked", () => {
    const closeReactionBarFunction = vi.fn();
    renderNoteReactionPicker(closeReactionBarFunction);
    fireEvent.click(screen.getByText(PERMANENT_EMOJIS[0].reactionType));
    expect(closeReactionBarFunction).toHaveBeenCalled();
  });
});
