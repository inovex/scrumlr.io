import {render} from "testUtils";
import {Requests} from "../Requests";
import {Request} from "store/features/requests/types";

describe("JoinRequest", () => {
  const createJoinRequest = (numRequests: number): Request[] =>
    Array.from({length: numRequests}, (_, i) => ({
      user: {
        id: `user-id-${i}`,
        name: `user-name-${i}`,
        isAnonymous: false,
      },
      status: "PENDING",
    }));

  const renderJoinRequest = (numRequests: number) => {
    const requests = createJoinRequest(numRequests);
    return render(<Requests requests={requests} participantsWithRaisedHand={[]} />);
  };

  describe("should render correctly", () => {
    test("on single join request", () => {
      const {container} = renderJoinRequest(1);
      expect(container.firstChild).toMatchSnapshot();
    });

    test("on multiple join requests", () => {
      const {container} = renderJoinRequest(3);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
