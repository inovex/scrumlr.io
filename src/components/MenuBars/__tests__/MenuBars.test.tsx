import {MenuBars} from "components/MenuBars";
import {Provider} from "react-redux";
import {MockStoreEnhanced} from "redux-mock-store";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {useTimer} from "../../../utils/hooks/useTimerLeft";
import getTestParticipant from "../../../utils/test/getTestParticipant";

jest.mock("../../../utils/hooks/useTimerLeft");

const createMenuBars = (store: MockStoreEnhanced) => (
  <Provider store={store}>
    <MenuBars showNextColumn showPreviousColumn onNextColumn={() => {}} onPreviousColumn={() => {}} />
  </Provider>
);

describe("MenuBars", () => {
  beforeEach(() => {
    (useTimer as jest.Mock).mockReturnValue({timerExpired: false});
  });

  test("should match snapshot", () => {
    (useTimer as jest.Mock).mockReturnValue({timerExpired: false});

    const store = getTestStore({
      participants: {
        self: getTestParticipant({role: "MODERATOR"}),
        others: [],
      },
    });
    const {container} = render(createMenuBars(store));
    expect(container.firstChild).toMatchSnapshot();
  });

  test("should render both user- and admin-menu for moderators", () => {
    (useTimer as jest.Mock).mockReturnValue({timerExpired: false});

    const store = getTestStore({
      participants: {
        self: getTestParticipant({role: "MODERATOR"}),
        others: [],
      },
    });
    const {container} = render(createMenuBars(store));
    expect(container.getElementsByClassName("admin-menu").length).toBe(1);
    expect(container.getElementsByClassName("user-menu").length).toBe(1);
  });

  test("should only render user-menu for participants", () => {
    (useTimer as jest.Mock).mockReturnValue({timerExpired: false});

    const store = getTestStore({
      participants: {
        self: getTestParticipant({role: "PARTICIPANT"}),
        others: [],
      },
    });
    const {container} = render(createMenuBars(store));
    expect(container.getElementsByClassName("menu__items").length).toBe(1);
    expect(container.getElementsByClassName("user-menu").length).toBe(1);
  });
});

describe("Mark me as Done Tooltip Logic", () => {
  beforeEach(() => {
    (useTimer as jest.Mock).mockReturnValue({timerExpired: false});
  });

  it("Does not expand the tooltip if the timer is not expired", () => {
    (useTimer as jest.Mock).mockReturnValue({timerExpired: false});
    const store = getTestStore({
      participants: {
        self: getTestParticipant(),
        others: [],
      },
    });
    const {asFragment} = render(createMenuBars(store));
    expect(asFragment()).toMatchSnapshot();
  });

  it("Does not expand the tooltip if the possibleVotes !== usedVotes", () => {
    (useTimer as jest.Mock).mockReturnValue({timerExpired: false});
    const store = getTestStore({
      participants: {
        self: getTestParticipant(),
        others: [],
      },
    });
    const {asFragment} = render(createMenuBars(store));
    expect(asFragment()).toMatchSnapshot();
  });
  it("Expand the tooltip everytime a potential ready state in voting is fulfilled.", () => {
    (useTimer as jest.Mock).mockReturnValue({timerExpired: false});
    const store = getTestStore({
      participants: {
        self: getTestParticipant(),
        others: [],
      },
    });
    const {asFragment} = render(createMenuBars(store));
    expect(asFragment()).toMatchSnapshot();
  });
});
