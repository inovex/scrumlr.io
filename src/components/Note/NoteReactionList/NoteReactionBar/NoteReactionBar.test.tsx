import {fireEvent, render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {REACTION_EMOJI_MAP} from "types/reaction";
import {Provider} from "react-redux";
import {ApplicationState} from "types";
import getTestApplicationState from "utils/test/getTestApplicationState";
import getTestStore from "utils/test/getTestStore";
import {getEmojiWithSkinTone} from "utils/reactions";
import {NoteReactionBar} from "./NoteReactionBar";

const renderNoteReactionBar = (close?: () => void, click?: () => void, overwrite?: Partial<ApplicationState>) =>
  render(
    <Provider store={getTestStore(overwrite)}>
      <NoteReactionBar closeReactionBar={close ?? jest.fn()} reactions={[]} handleClickReaction={click ?? jest.fn()} />
    </Provider>
  );

describe("NoteReactionBar", () => {
  it("renders the reaction buttons correctly", () => {
    renderNoteReactionBar();
    REACTION_EMOJI_MAP.forEach((emoji) => {
      expect(screen.getByText(emoji.emoji)).toBeInTheDocument();
    });
  });

  it("calls handleClickBar when a reaction button is clicked", () => {
    const handleClickReactionFunction = jest.fn();
    renderNoteReactionBar(undefined, handleClickReactionFunction);
    fireEvent.click(screen.getByText("👍"));
    expect(handleClickReactionFunction).toHaveBeenCalled();
  });

  it("closes the reaction bar when Escape key is pressed", () => {
    const closeReactionBarFunction = jest.fn();
    renderNoteReactionBar(closeReactionBarFunction);
    fireEvent.keyDown(document, {key: "Escape"});
    expect(closeReactionBarFunction).toHaveBeenCalled();
  });

  it("focuses the first emoji button after TAB is pressed on the last emoji button", async () => {
    renderNoteReactionBar(jest.fn(), jest.fn(), getTestApplicationState());
    const firstEmojiButton = screen.getByText([...REACTION_EMOJI_MAP.values()].at(0)!.emoji);
    const lastEmojiButton = screen.getByText([...REACTION_EMOJI_MAP.values()].at(-1)!.emoji);

    lastEmojiButton.focus();
    expect(lastEmojiButton).toHaveFocus();
    await userEvent.tab();
    expect(firstEmojiButton).toHaveFocus();
  });

  it("render emoji in different skin tone", () => {
    renderNoteReactionBar(undefined, undefined, {skinTone: {name: "dark", component: "🏿"}});
    REACTION_EMOJI_MAP.forEach((emoji) => {
      expect(screen.getByText(getEmojiWithSkinTone(emoji, {name: "dark", component: "🏿"}))).toBeInTheDocument();
    });
  });
});
