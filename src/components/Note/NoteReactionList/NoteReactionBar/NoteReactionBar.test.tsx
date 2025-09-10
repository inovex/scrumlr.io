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
}));

describe("EmojiPickerReactionBar", () => {
  it("renders the component with quick reactions", () => {
    renderEmojiPickerReactionBar();
    // Check that reaction buttons are rendered
    const reactionButtons = screen.getAllByRole("button");
    expect(reactionButtons).toHaveLength(6); // 5 reactions + 1 plus button
  });

  it("renders the plus button", () => {
    renderEmojiPickerReactionBar();
    expect(screen.getByText("➕")).toBeInTheDocument();
  });

  it("calls handleClickReaction when a reaction button is clicked", () => {
    const handleClickReactionFunction = jest.fn();
    renderEmojiPickerReactionBar(undefined, handleClickReactionFunction);
    const reactionButtons = screen.getAllByRole("button");
    // Click first reaction button (not the plus button)
    fireEvent.click(reactionButtons[0]);
    expect(handleClickReactionFunction).toHaveBeenCalled();
  });

  it("closes the reaction bar when Escape key is pressed", () => {
    const closeReactionBarFunction = jest.fn();
    renderEmojiPickerReactionBar(closeReactionBarFunction);
    fireEvent.keyDown(document, {key: "Escape"});
    expect(closeReactionBarFunction).toHaveBeenCalled();
  });

  it("shows emoji picker when plus button is clicked", () => {
    renderEmojiPickerReactionBar();
    const plusButton = screen.getByText("➕");
    fireEvent.click(plusButton);
    expect(screen.getByTestId("emoji-picker")).toBeInTheDocument();
  });
});
