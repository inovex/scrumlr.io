import {Provider} from "react-redux";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import getTestParticipant from "utils/test/getTestParticipant";
import {SettingsDialog} from "components/SettingsDialog";
import {ENABLE_ALL} from "constants/settings";

const createSettingsDialog = (enableAll: boolean, isModerator: boolean) => (
  <Provider store={getTestStore({participants: {self: getTestParticipant({role: isModerator ? "MODERATOR" : "PARTICIPANT"}), others: [], focusInitiator: null}})}>
    <SettingsDialog enabledMenuItems={enableAll ? ENABLE_ALL : {appearance: true, feedback: true, profile: true}} />
  </Provider>
);

describe("SettingsDialog", () => {
  beforeEach(() => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
  });

  test("should render correctly", () => {
    const {container} = render(createSettingsDialog(true, true), {container: global.document.querySelector("#portal")!});
    expect(container).toMatchSnapshot();
  });

  it("should have all menu items", () => {
    const {container} = render(createSettingsDialog(true, true), {container: global.document.querySelector("#portal")!});
    const menuItems = container.getElementsByClassName("navigation__item");
    expect(menuItems.length).toBe(7);
  });

  it("should have limited menu items", () => {
    const {container} = render(createSettingsDialog(false, true), {container: global.document.querySelector("#portal")!});
    const menuItems = container.getElementsByClassName("navigation__item");
    expect(menuItems.length).toBe(3);
  });

  it("should have one menu item less available for non-moderators", () => {
    const {container} = render(createSettingsDialog(true, false), {container: global.document.querySelector("#portal")!});
    const menuItems = container.getElementsByClassName("navigation__item");
    expect(menuItems.length).toBe(6);
  });
});
