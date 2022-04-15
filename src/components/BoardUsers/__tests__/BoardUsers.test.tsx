import {render} from "testUtils";
import {Provider} from "react-redux";
import {BoardUsers} from "components/BoardUsers";
import {ApplicationState} from "types";
import getTestStore from "utils/test/getTestStore";
import getTestParticipant from "utils/test/getTestParticipant";

const createBoardUsers = (overwrite?: Partial<ApplicationState>) => {
  return (
    <Provider store={getTestStore(overwrite)}>
      <BoardUsers />
    </Provider>
  );
};

describe("users", () => {
  test("correct number of online users & count of rest users", () => {
    const boardUsers = render(
      createBoardUsers({
        participants: {self: getTestParticipant(), others: [getTestParticipant({connected: false}), getTestParticipant(), getTestParticipant(), getTestParticipant()]},
      })
    );
    expect(boardUsers.container.querySelectorAll(".user-avatar")).toHaveLength(4);

    // 5 online users -> display 5
    const newBoardUsers1 = render(
      createBoardUsers({
        participants: {
          self: getTestParticipant(),
          others: [getTestParticipant({connected: false}), getTestParticipant(), getTestParticipant(), getTestParticipant(), getTestParticipant()],
        },
      })
    );
    expect(newBoardUsers1.container.querySelectorAll(".user-avatar")).toHaveLength(5);

    // 6 online users -> display 4 & rest user count of 2
    const newBoardUsers2 = render(
      createBoardUsers({
        participants: {
          self: getTestParticipant(),
          others: [getTestParticipant({connected: false}), getTestParticipant(), getTestParticipant(), getTestParticipant(), getTestParticipant(), getTestParticipant()],
        },
      })
    );
    expect(newBoardUsers2.container.querySelectorAll(".user-avatar")).toHaveLength(4);
    expect(newBoardUsers2.container.querySelector(".rest-users__count")).toHaveTextContent("2");
  });
});
