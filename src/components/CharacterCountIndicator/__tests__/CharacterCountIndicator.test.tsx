import {render} from "testUtils";
import {CharacterCountIndicator} from "components/CharacterCountIndicator/CharacterCountIndicator";

describe("CharacterCountIndicator", () => {
  it("should not render below 75% of the limit", () => {
    const {container} = render(<CharacterCountIndicator value={"a".repeat(767)} maxLength={1024} />);
    expect(container.querySelector(".character-count-indicator")).toBeNull();
  });

  it("should render when 75% of the limit is reached", () => {
    const {container} = render(<CharacterCountIndicator value={"a".repeat(768)} maxLength={1024} />);
    expect(container.querySelector(".character-count-indicator")).toHaveTextContent("768/1024");
  });

  it("should render when the limit is reached", () => {
    const {container} = render(<CharacterCountIndicator value={"a".repeat(1024)} maxLength={1024} />);
    expect(container.querySelector(".character-count-indicator")).toHaveTextContent("1024/1024");
  });
});
