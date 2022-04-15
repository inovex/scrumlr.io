import {Provider} from "react-redux";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {SettingsDialog} from "..";

const createSettingsDialog = () => (
  <Provider store={getTestStore()}>
    <SettingsDialog />
  </Provider>
);

describe("SettingsDialog", () => {
  beforeEach(() => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
  });

  test("should render correctly", () => {
    const {container} = render(createSettingsDialog(), {container: global.document.querySelector("#portal")!});
    expect(container).toMatchSnapshot();
  });
});
