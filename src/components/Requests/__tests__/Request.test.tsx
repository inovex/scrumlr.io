import {render} from "testUtils";
import {Requests} from "../Requests";

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
    test("on single join request", () => {
      const {container} = render(createJoinRequest(1));
      expect(container.firstChild).toMatchSnapshot();
    });

    test("on multiple join requests", () => {
      const {container} = render(createJoinRequest(3));
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
