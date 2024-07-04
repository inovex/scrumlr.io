import {fireEvent, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {REACTION_EMOJI_MAP} from "types/reaction";
import {NoteReactionBar} from "./NoteReactionBar";

describe("NoteReactionBar", () => {
  it("renders the reaction buttons correctly", () => {
    render(<NoteReactionBar closeReactionBar={() => {}} reactions={[]} handleClickReaction={() => {}} />);

    REACTION_EMOJI_MAP.forEach((emoji) => {
      expect(screen.getByText(emoji.emoji)).toBeInTheDocument();
    });
  });

  it("calls handleClickBar when a reaction button is clicked", () => {
    const handleClickReaction = jest.fn();
    render(<NoteReactionBar closeReactionBar={() => {}} reactions={[]} handleClickReaction={handleClickReaction} />);
    fireEvent.click(screen.getByText("👍"));
    expect(handleClickReaction).toHaveBeenCalled();
  });

  it("closes the reaction bar when Escape key is pressed", () => {
    const closeReactionBar = jest.fn();
    render(<NoteReactionBar closeReactionBar={closeReactionBar} reactions={[]} handleClickReaction={() => {}} />);
    fireEvent.keyDown(document, {key: "Escape"});
    expect(closeReactionBar).toHaveBeenCalled();
  });

  it("focuses the first emoji button after TAB is pressed on the last emoji button", async () => {
    render(<NoteReactionBar closeReactionBar={() => {}} reactions={[]} handleClickReaction={() => {}} />);

    // @ts-ignore
    const firstEmojiButton = screen.getByText([...REACTION_EMOJI_MAP.values()].at(0).emoji!);
    // @ts-ignore
    const lastEmojiButton = screen.getByText([...REACTION_EMOJI_MAP.values()].at(-1).emoji!);

    lastEmojiButton.focus();
    expect(lastEmojiButton).toHaveFocus();
    await userEvent.tab();
    expect(firstEmojiButton).toHaveFocus();
  });
});
