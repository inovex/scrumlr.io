import {MenuBars} from "components/MenuBars";
import {Provider} from "react-redux";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {useTimer} from "utils/hooks/useTimerLeft";
import getTestParticipant from "../../../utils/test/getTestParticipant";
import {Mock} from "vitest";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {ParticipantRole} from "store/features";

vi.mock("utils/hooks/useTimerLeft");

const createMenuBars = (selfRole: ParticipantRole) => (
  <Provider store={getTestStore({participants: {...getTestApplicationState().participants, self: getTestParticipant({role: selfRole})}})}>
    <MenuBars showNextColumn showPreviousColumn onNextColumn={() => {}} onPreviousColumn={() => {}} />
  </Provider>
);

describe("MenuBars", () => {
  beforeEach(() => {
    (useTimer as Mock).mockReturnValue({timerExpired: false});
  });

  test("should match snapshot", () => {
    (useTimer as Mock).mockReturnValue({timerExpired: false});

    const {container} = render(createMenuBars("MODERATOR"));
    expect(container.firstChild).toMatchSnapshot();
  });

  test("should render both user- and admin-menu for moderators", () => {
    (useTimer as Mock).mockReturnValue({timerExpired: false});

    const {container} = render(createMenuBars("MODERATOR"));
    expect(container.getElementsByClassName("admin-menu").length).toBe(1);
    expect(container.getElementsByClassName("user-menu").length).toBe(1);
  });

  test("should only render user-menu for participants", () => {
    (useTimer as Mock).mockReturnValue({timerExpired: false});

    const {container} = render(createMenuBars("PARTICIPANT"));
    expect(container.getElementsByClassName("menu__items").length).toBe(1);
    expect(container.getElementsByClassName("user-menu").length).toBe(1);
  });
});

describe("Mark me as Done Tooltip Logic", () => {
  beforeEach(() => {
    (useTimer as Mock).mockReturnValue({timerExpired: false});
  });

  it("Does not expand the tooltip if the timer is not expired", () => {
    (useTimer as Mock).mockReturnValue({timerExpired: false});

    const {asFragment} = render(createMenuBars("PARTICIPANT"));
    expect(asFragment()).toMatchSnapshot();
  });

  it("Does not expand the tooltip if the possibleVotes !== usedVotes", () => {
    (useTimer as Mock).mockReturnValue({timerExpired: false});

    const {asFragment} = render(createMenuBars("PARTICIPANT"));
    expect(asFragment()).toMatchSnapshot();
  });
  it("Expand the tooltip everytime a potential ready state in voting is fulfilled.", () => {
    (useTimer as Mock).mockReturnValue({timerExpired: false});

    const {asFragment} = render(createMenuBars("PARTICIPANT"));
    expect(asFragment()).toMatchSnapshot();
  });
});
