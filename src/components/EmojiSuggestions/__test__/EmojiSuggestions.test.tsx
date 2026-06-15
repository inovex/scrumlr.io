import {Provider} from "react-redux";
import {ApplicationState} from "store";
import getTestStore from "utils/test/getTestStore";
import {ComponentProps} from "react";
import {render} from "@testing-library/react";
import {EmojiData} from "utils/hooks/useEmojiAutocomplete";
import {EmojiSuggestions} from "../EmojiSuggestions";

type EmojiSuggestionsProps = ComponentProps<typeof EmojiSuggestions>;

const mockEmojis: EmojiData[] = [
  ["face_with_tears_of_joy", "😂", false, ["face_with_tears_of_joy", "face", "cry", "tears", "weep", "happy", "happytears", "haha"]],
  ["sparkling_heart", "💖", false, ["sparkling_heart", "love", "like", "affection", "valentines"]],
  ["thumbs_up", "👍", true, ["thumbs_up", "thumbsup", "yes", "awesome", "good", "agree", "accept", "cool", "hand", "like"]],
  ["woman_pilot", "👩‍✈️", true, ["woman_pilot", "aviator", "plane", "woman", "human"]],
];

function createSuggestions(props: Partial<EmojiSuggestionsProps> = {}, state?: Partial<ApplicationState>) {
  const suggestionAutocompleteProps: EmojiSuggestionsProps = {
    acceptSuggestion: vi.fn(),
    keyboardFocusedIndex: 0,
    suggestions: mockEmojis,
    ...props,
  };

  return (
    <Provider store={getTestStore(state)}>
      <EmojiSuggestions {...suggestionAutocompleteProps} />
    </Provider>
  );
}

describe("EmojiSuggestions", () => {
  it("should match the snapshot", () => {
    const {container} = render(createSuggestions());
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should accept suggestion on click", () => {
    const acceptSuggestion = vi.fn();
    const {container} = render(
      createSuggestions({
        acceptSuggestion,
      })
    );

    const element = container.getElementsByClassName("emoji-suggestions__element-button");
    element.item(0)?.dispatchEvent(new MouseEvent("mousedown", {bubbles: true}));

    expect(acceptSuggestion).toHaveBeenCalledWith("😂");
  });

  describe("should use skin tones where supported", () => {
    it("should use skin tone from store", () => {
      const {container} = render(createSuggestions({}, {skinTone: {name: "medium", component: "🏽"}}));
      expect(container.firstChild).toMatchSnapshot();
    });

    it("should pass skin tone to acceptSuggestions", () => {
      const acceptSuggestion = vi.fn();
      const {container} = render(
        createSuggestions(
          {
            acceptSuggestion,
          },
          {skinTone: {name: "medium", component: "🏽"}}
        )
      );

      const element = container.getElementsByClassName("emoji-suggestions__element-button");

      element.item(2)?.dispatchEvent(new MouseEvent("mousedown", {bubbles: true}));
      expect(acceptSuggestion).toHaveBeenCalledWith("👍🏽");

      element.item(3)?.dispatchEvent(new MouseEvent("mousedown", {bubbles: true}));
      expect(acceptSuggestion).toHaveBeenCalledWith("👩🏽‍✈️");
    });
  });
});
