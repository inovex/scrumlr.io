import {act, fireEvent} from "@testing-library/react";
import {Column} from "components/Column";
import {Color} from "constants/colors";
import {Provider} from "react-redux";
import {BoardComponent} from "components/Board";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {CustomDndContext} from "components/DragAndDrop/CustomDndContext";

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
  beforeEach(() => {
    window.IntersectionObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        }) as unknown as IntersectionObserver
    );

    window.ResizeObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        }) as unknown as ResizeObserver
    );
  });

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
        const {container} = render(createBoardWithColumns("lean-lilac"));
        const board = container.querySelector(".board");
        expect(board?.childNodes[1]).toHaveClass("accent-color__lean-lilac");
        expect(board?.lastChild).toHaveClass("accent-color__lean-lilac");
      });
    });
  });
});

describe("navigation", () => {
  beforeEach(() => {
    window.IntersectionObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        }) as unknown as IntersectionObserver
    );

    window.ResizeObserver = jest.fn(
      () =>
        ({
          observe: jest.fn(),
          disconnect: jest.fn(),
        }) as unknown as ResizeObserver
    );

    const root = global.document.createElement("div");
    root.setAttribute("id", "root");
    global.document.querySelector("body")!.appendChild(root);
  });

  let intersectionObserver: IntersectionObserver;

  beforeEach(() => {
    intersectionObserver = {
      observe: jest.fn(),
      disconnect: jest.fn(),
    } as unknown as IntersectionObserver;
    window.IntersectionObserver = jest.fn(() => intersectionObserver);
  });

  test("intersection observer is registered on mount", () => {
    render(createBoardWithColumns("lean-lilac", "backlog-blue"));
    expect(window.IntersectionObserver).toHaveBeenCalled();
    expect(intersectionObserver.observe).toHaveBeenCalledTimes(2);
  });

  test("intersection observer is disconnected on unmount", () => {
    render(createBoardWithColumns("planning-pink")).unmount();
    expect(intersectionObserver.disconnect).toHaveBeenCalledTimes(1);
  });

  test("intersection observer is re-initialized on change of children", () => {
    const {rerender} = render(createBoardWithColumns("planning-pink"));

    expect(window.IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(intersectionObserver.disconnect).toHaveBeenCalledTimes(0);

    rerender(createBoardWithColumns("planning-pink", "backlog-blue"));

    expect(window.IntersectionObserver).toHaveBeenCalledTimes(2);
    expect(intersectionObserver.disconnect).toHaveBeenCalledTimes(1);
  });

  describe("buttons visibility and functionality", () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = render(createBoardWithColumns("planning-pink", "backlog-blue", "poker-purple")).container;
    });

    const showColumns = (first: boolean, second: boolean, third: boolean) => {
      const columns = container.querySelectorAll(".column");
      act(() => {
        const firstMethodCall = 0;
        const firstMethodParameter = 0;

        const intersectionObserverCallback = (window.IntersectionObserver as unknown as IntersectionObserver).mock.calls[firstMethodCall][firstMethodParameter];
        intersectionObserverCallback([
          {isIntersecting: first, target: columns[0]},
          {isIntersecting: second, target: columns[1]},
          {isIntersecting: third, target: columns[2]},
        ]);
      });
      return columns;
    };

    test("correct scroll of previous button", () => {
      const columns = showColumns(false, true, false);
      const scrollIntoView = jest.fn();
      columns[0].scrollIntoView = scrollIntoView;
      fireEvent.click(container.querySelectorAll(".menu-bars__navigation")[0] as HTMLElement);

      expect(scrollIntoView).toHaveBeenCalled();
    });

    test("correct scroll of next button", () => {
      const columns = showColumns(false, true, false);

      const scrollIntoView = jest.fn();
      columns[2].scrollIntoView = scrollIntoView;
      fireEvent.click(container.querySelectorAll(".menu-bars__navigation")[1] as HTMLElement);

      expect(scrollIntoView).toHaveBeenCalled();
    });
  });
});
