import {render} from "testUtils";
import {MenuBars} from "components/MenuBars";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {MockStoreEnhanced} from "redux-mock-store";
import getTestParticipant from "../../../utils/test/getTestParticipant";
import {useTimer} from "../../../utils/hooks/useTimerLeft";
import {act} from "@testing-library/react";
import {getByTestId} from "@testing-library/dom";

jest.mock("../../../utils/hooks/useTimerLeft");

const createMenuBars = (store: MockStoreEnhanced) => (
  <Provider store={store}>
    <MenuBars />
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
  it("Does not expand the tooltip multiple times", () => {});

  it("Does not expand the tooltip if the timer expired and user is already ready", () => {
    jest.useFakeTimers();
    (useTimer as jest.Mock).mockReturnValue({timerExpired: true});
    const store = getTestStore({
      participants: {
        self: getTestParticipant({ready: true}),
        others: [],
      },
    });
    const {getByTestId} = render(createMenuBars(store));
    const button = getByTestId("mark-as-done-button");
    expect(button).not.toHaveClass("tooltip-button--content-extended");
    act(() => {
      jest.advanceTimersByTime(30000);
    });
    expect(button).not.toHaveClass("tooltip-button--content-extended");
  });

  it("Expands the tooltip only 1 within 30 seconds after the timer has expired.", () => {});
});
