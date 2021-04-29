import {render, fireEvent} from "@testing-library/react";
import JoinRequest from "./JoinRequest";
import store from "../../store";
import {ActionFactory} from "../../store/action";

jest.mock("store", () => ({
  dispatch: jest.fn(),
}));

describe("JoinRequest", () => {
  const createJoinRequest = (numRequests: number) => {
    const joinRequests = [];
    for (let i = 0; i < numRequests; ++i) {
      joinRequests.push({
        id: `id-${i}`,
        userId: `userId-${i}`,
        displayName: `displayName-${i}`,
        boardId: `boardId-${i}`,
        status: "pending",
      });
    }
    return <JoinRequest joinRequests={joinRequests} />;
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
      fireEvent.click(container.querySelector(".join-request__footer").firstChild);
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.rejectJoinRequest("id-0", "boardId-0", "userId-0"));
    });

    test("single join request should call acceptJoinRequest correctly", () => {
      const {container} = render(createJoinRequest(1));
      fireEvent.click(container.querySelector(".join-request__footer").lastChild);
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.acceptJoinRequest("id-0", "boardId-0", "userId-0"));
    });

    test("multiple join request should call rejectAllPendingJoinRequests correctly", () => {
      const {container} = render(createJoinRequest(3));
      fireEvent.click(container.querySelector(".join-request__footer").firstChild);
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.rejectAllPendingJoinRequests("boardId-0"));
    });

    test("multiple join request should call acceptAllPendingJoinRequests correctly", () => {
      const {container} = render(createJoinRequest(3));
      fireEvent.click(container.querySelector(".join-request__footer").lastChild);
      expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.acceptAllPendingJoinRequests("boardId-0"));
    });

    test("multiple join request should call acceptJoinRequest in requests list item correctly", () => {
      const {container} = render(createJoinRequest(3));
      const figures = container.querySelectorAll(".join-request__requests-figure");
      for (let i = 0; i < figures.length; ++i) {
        fireEvent.click(figures[i].children[2]);
        expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.rejectJoinRequest(`id-${i}`, `boardId-${i}`, `userId-${i}`));
      }
    });

    test("multiple join request should call acceptJoinRequest in requests list item correctly", () => {
      const {container} = render(createJoinRequest(3));
      const figures = container.querySelectorAll(".join-request__requests-figure");
      for (let i = 0; i < figures.length; ++i) {
        fireEvent.click(figures[i].children[3]);
        expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.acceptJoinRequest(`id-${i}`, `boardId-${i}`, `userId-${i}`));
      }
    });
  });
});
