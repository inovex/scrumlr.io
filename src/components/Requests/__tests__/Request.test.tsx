import {fireEvent, getByText} from "@testing-library/react";
import {Requests} from "components/Requests";
import {Actions} from "store/action";
import {render} from "testUtils";
import * as redux from "react-redux";
import {Dispatch, Action} from "redux";

describe("JoinRequest", () => {
  const createJoinRequest = (numRequests: number) => {
    const joinRequests = [];
    for (let i = 0; i < numRequests; i += 1) {
      joinRequests.push({
        user: {
          id: `user-id-${i}`,
          name: `user-name-${i}`,
        },
        status: "PENDING" as const,
      });
    }
    return <Requests requests={joinRequests} participantsWithRaisedHand={[]} />;
  };

  describe("should render correctly", () => {
    const useDispatchSpy = jest.spyOn(redux, "useDispatch");
    const mockDispatchFn = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatchFn);

    test("on single join request", () => {
      const {container} = render(createJoinRequest(1));
      expect(container.firstChild).toMatchSnapshot();
    });

    test("on multiple join requests", () => {
      const {container} = render(createJoinRequest(3));
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("should call dispatch correctly", () => {
    let mockDispatchFn: jest.Mock<any, any> | Dispatch<Action<any>>;

    beforeEach(() => {
      jest.clearAllMocks();
      const useDispatchSpy = jest.spyOn(redux, "useDispatch");
      mockDispatchFn = jest.fn();
      useDispatchSpy.mockReturnValue(mockDispatchFn);
    });

    test("single join request should call rejectJoinRequest correctly", () => {
      const {container} = render(createJoinRequest(1));
      fireEvent.click(getByText(container, "Reject"));
      expect(mockDispatchFn).toHaveBeenCalledWith(Actions.rejectJoinRequests(["user-id-0"]));
    });

    test("single join request should call acceptJoinRequest correctly", () => {
      const {container} = render(createJoinRequest(1));
      fireEvent.click(getByText(container, "Accept"));
      expect(mockDispatchFn).toHaveBeenCalledWith(Actions.acceptJoinRequests(["user-id-0"]));
    });

    test("multiple join request should call rejectJoinRequests in requests list item correctly", () => {
      const {container} = render(createJoinRequest(3));
      const figures = container.querySelectorAll(".join-request__requests-figure");
      for (let i = 0; i < figures.length; i += 1) {
        fireEvent.click(figures[i].children[2]);
        expect(mockDispatchFn).toHaveBeenCalledWith(Actions.rejectJoinRequests([`user-id-${i}`]));
      }
    });

    test("multiple join request should call acceptJoinRequests in requests list item correctly", () => {
      const {container} = render(createJoinRequest(3));
      const figures = container.querySelectorAll(".join-request__requests-figure");
      for (let i = 0; i < figures.length; i += 1) {
        fireEvent.click(figures[i].children[3]);
        expect(mockDispatchFn).toHaveBeenCalledWith(Actions.acceptJoinRequests([`user-id-${i}`]));
      }
    });
  });
});
