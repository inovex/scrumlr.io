import {fireEvent, render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {ApplicationState} from "store";
import getTestStore from "utils/test/getTestStore";
import {EmojiPickerReactionBar} from "../EmojiPickerReactionBar/EmojiPickerReactionBar";

const renderEmojiPickerReactionBar = (close?: () => void, click?: () => void, overwrite?: Partial<ApplicationState>) =>
  render(
    <Provider store={getTestStore(overwrite)}>
      <EmojiPickerReactionBar closeReactionBar={close ?? jest.fn()} reactions={[]} handleClickReaction={click ?? jest.fn()} />
    </Provider>
  );

// Mock the emoji-picker-react to avoid test environment issues
jest.mock("emoji-picker-react", () => ({
  __esModule: true,
  default: () => <div data-testid="emoji-picker">Mocked EmojiPicker</div>,
  Emoji: ({unified, size}: {unified: string; size: number}) => (
    <span data-testid={`emoji-${unified}`} style={{fontSize: `${size}px`}}>
      Mock Emoji
    </span>
  ),
  EmojiStyle: {
    NATIVE: "native",
  },
}));

describe("EmojiPickerReactionBar", () => {
  it("renders the component with quick reactions", () => {
    renderEmojiPickerReactionBar();
    // Check that reaction buttons are rendered
    const reactionButtons = screen.getAllByRole("button");
    expect(reactionButtons).toHaveLength(7); // 6 reactions + 1 show more button
  });

  it("renders the show more button", () => {
    renderEmojiPickerReactionBar();
    expect(screen.getByLabelText("More emojis")).toBeInTheDocument();
  });

  it("calls handleClickReaction when a reaction button is clicked", () => {
    const handleClickReactionFunction = jest.fn();
    renderEmojiPickerReactionBar(undefined, handleClickReactionFunction);
    const reactionButtons = screen.getAllByRole("button");
    // Click first reaction button (not the show more button)
    fireEvent.click(reactionButtons[0]);
    expect(handleClickReactionFunction).toHaveBeenCalled();
  });

  it("closes the reaction bar when Escape key is pressed", () => {
    const closeReactionBarFunction = jest.fn();
    renderEmojiPickerReactionBar(closeReactionBarFunction);
    fireEvent.keyDown(document, {key: "Escape"});
    expect(closeReactionBarFunction).toHaveBeenCalled();
  });

  it("shows emoji picker when show more button is clicked", () => {
    renderEmojiPickerReactionBar();
    const showMoreButton = screen.getByLabelText("More emojis");
    fireEvent.click(showMoreButton);
    expect(screen.getByTestId("emoji-picker")).toBeInTheDocument();
  });
});
