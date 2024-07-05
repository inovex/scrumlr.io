import {fireEvent, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {REACTION_EMOJI_MAP} from "types/reaction";
import {Provider} from "react-redux";
import {NoteReactionBar} from "./NoteReactionBar";
import {ApplicationState} from "../../../../types";
import getTestApplicationState from "../../../../utils/test/getTestApplicationState";
import getTestStore from "../../../../utils/test/getTestStore";

const renderNoteReactionBar = (closeReactionBar: jest.Mock, overwrite?: Partial<ApplicationState>) => render(
    <Provider store={getTestStore(overwrite)}>
      <NoteReactionBar closeReactionBar={closeReactionBar} reactions={[]} handleClickReaction={() => {}} />
    </Provider>
  );

describe("NoteReactionBar", () => {
  it("renders the reaction buttons correctly", () => {
    renderNoteReactionBar(null, getTestApplicationState());
    REACTION_EMOJI_MAP.forEach((emoji) => {
      expect(screen.getByText(emoji.emoji)).toBeInTheDocument();
    });
  });

  it("calls handleClickBar when a reaction button is clicked", () => {
    const handleClickReaction = jest.fn();
    renderNoteReactionBar(handleClickReaction, getTestApplicationState());
    fireEvent.click(screen.getByText("👍"));
    expect(handleClickReaction).toHaveBeenCalled();
  });

  it("closes the reaction bar when Escape key is pressed", () => {
    const closeReactionBar = jest.fn();
    renderNoteReactionBar(closeReactionBar, getTestApplicationState());
    fireEvent.keyDown(document, {key: "Escape"});
    expect(closeReactionBar).toHaveBeenCalled();
  });

  it("focuses the first emoji button after TAB is pressed on the last emoji button", async () => {
    renderNoteReactionBar(null, getTestApplicationState());
    const firstEmojiButton = screen.getByText([...REACTION_EMOJI_MAP.values()].at(0)!.emoji);
    const lastEmojiButton = screen.getByText([...REACTION_EMOJI_MAP.values()].at(-1)!.emoji);

    lastEmojiButton.focus();
    expect(lastEmojiButton).toHaveFocus();
    await userEvent.tab();
    expect(firstEmojiButton).toHaveFocus();
  });
});
