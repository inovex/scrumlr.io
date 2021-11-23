import {fireEvent, getByText} from "@testing-library/react";
import {Request} from "components/Request";
import store from "store";
import {ActionFactory} from "store/action";
import {render} from "testUtils";

jest.mock("store", () => ({
  dispatch: jest.fn(),
}));

describe("JoinRequest", () => {
  const createJoinRequest = (numRequests: number) => {
    const joinRequests = [];
    for (let i = 0; i < numRequests; i += 1) {
      joinRequests.push({
        id: `id-${i}`,
        userId: `userId-${i}`,
        displayName: `displayName-${i}`,
        boardId: `boardId-${i}`,
        status: "pending" as const,
      });
    }
    return <Request joinRequests={joinRequests} />;
  };

  describe("should render correctly", () => {
    test("on single join request", () => {
      const {container} = render(createJoinRequest(1));
      expect(container.firstChild).toMatchSnapshot();
    });

    test("on multiple join requests", () => {
      const {container} = render(createJoinRequest(3));
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("should call store.dispatch correctly", () => {
    test("single join request should call rejectJoinRequest correctly", () => {
      const {container} = render(createJoinRequest(1));
      fireEvent.click(getByText(container, "Reject"));
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.rejectJoinRequests("boardId-0", ["userId-0"]));
    });

    test("single join request should call acceptJoinRequest correctly", () => {
      const {container} = render(createJoinRequest(1));
      fireEvent.click(getByText(container, "Accept"));
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.acceptJoinRequests("boardId-0", ["userId-0"]));
    });

    test("multiple join request should call acceptJoinRequests correctly", () => {
      const {container} = render(createJoinRequest(3));
      fireEvent.click(getByText(container, "Accept all")!);
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.acceptJoinRequests("boardId-0", ["userId-0", "userId-1", "userId-2"]));
    });

    test("multiple join request should call rejectJoinRequests correctly", () => {
      const {container} = render(createJoinRequest(3));
      fireEvent.click(getByText(container, "Reject all")!);
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.rejectJoinRequests("boardId-0", ["userId-0", "userId-1", "userId-2"]));
    });

    test("multiple join request should call rejectJoinRequests in requests list item correctly", () => {
      const {container} = render(createJoinRequest(3));
      const figures = container.querySelectorAll(".join-request__requests-figure");
      for (let i = 0; i < figures.length; i += 1) {
        fireEvent.click(figures[i].children[2]);
        expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.rejectJoinRequests(`boardId-${i}`, [`userId-${i}`]));
      }
    });

    test("multiple join request should call acceptJoinRequests in requests list item correctly", () => {
      const {container} = render(createJoinRequest(3));
      const figures = container.querySelectorAll(".join-request__requests-figure");
      for (let i = 0; i < figures.length; i += 1) {
        fireEvent.click(figures[i].children[3]);
        expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.acceptJoinRequests(`boardId-${i}`, [`userId-${i}`]));
      }
    });
  });
});
