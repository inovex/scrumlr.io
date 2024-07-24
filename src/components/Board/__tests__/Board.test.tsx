import {Column} from "components/Column";
import {Color} from "constants/colors";
import {Provider} from "react-redux";
import {BoardComponent} from "components/Board";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {CustomDndContext} from "components/DragAndDrop/CustomDndContext";

jest.mock("utils/hooks/useImageChecker.ts", () => ({
  useImageChecker: () => false,
}));

const createBoardWithColumns = (...colors: Color[]) => {
  return (
    <Provider store={getTestStore()}>
      <CustomDndContext>
        <BoardComponent currentUserIsModerator moderating={false}>
          {colors.map((color, index) => (
            <Column key={color} id="GG0fWzyCwd" color={colors[index]} name="Positive" visible={false} index={index} />
          ))}
        </BoardComponent>
      </CustomDndContext>
    </Provider>
  );
};

describe("basic", () => {
  test("show empty board", () => {
    const {container} = render(createBoardWithColumns());
    expect(container.firstChild).toHaveClass("board--empty");
  });

  test("correct number of columns is set in inner styles", () => {
    const {container} = render(createBoardWithColumns("lean-lilac", "planning-pink", "backlog-blue", "poker-purple"));
    expect(container.querySelector("style")).toHaveTextContent(".board { --board__columns: 4 }");
  });

  describe("side-panels", () => {
    test("left side-panel is present", () => {
      const {container} = render(createBoardWithColumns("backlog-blue", "planning-pink"));
      expect(container.querySelector(".board")?.firstChild).toHaveClass("board__spacer-left");
    });

    test("right side-panel is present", () => {
      const {container} = render(createBoardWithColumns("backlog-blue", "planning-pink"));
      expect(container.querySelector(".board")?.lastChild).toHaveClass("board__spacer-right");
    });

    test("left side-panel has correct accent color", () => {
      const {container} = render(createBoardWithColumns("backlog-blue", "planning-pink"));
      expect(container.querySelector(".board")?.firstChild).toHaveClass("accent-color__backlog-blue");
    });

    test("right side-panel has correct accent color", () => {
      const {container} = render(createBoardWithColumns("backlog-blue", "planning-pink"));
      expect(container.querySelector(".board")?.lastChild).toHaveClass("accent-color__planning-pink");
    });

    describe("side-panels", () => {
      test("left side-panel is present", () => {
        const {container} = render(createBoardWithColumns("backlog-blue", "planning-pink"));
        expect(container.querySelector(".board")?.firstChild).toHaveClass("board__spacer-left");
      });

      test("right side-panel is present", () => {
        const {container} = render(createBoardWithColumns("backlog-blue", "planning-pink"));
        expect(container.querySelector(".board")?.lastChild).toHaveClass("board__spacer-right");
      });

      test("left side-panel has correct accent color", () => {
        const {container} = render(createBoardWithColumns("backlog-blue", "planning-pink"));
        expect(container.querySelector(".board")?.firstChild).toHaveClass("accent-color__backlog-blue");
      });

      test("right side-panel has correct accent color", () => {
        const {container} = render(createBoardWithColumns("backlog-blue", "planning-pink"));
        expect(container.querySelector(".board")?.lastChild).toHaveClass("accent-color__planning-pink");
      });

      test("side-panels have correct accent color with single column", () => {
        const {container} = render(createBoardWithColumns("value-violet"));
        const board = container.querySelector(".board");
        expect(board?.childNodes[1]).toHaveClass("accent-color__value-violet");
        expect(board?.lastChild).toHaveClass("accent-color__value-violet");
      });
    });
  });
});
