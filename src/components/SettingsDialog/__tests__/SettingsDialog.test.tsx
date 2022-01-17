import {Provider} from "react-redux";
import {render} from "testUtils";
import configureStore from "redux-mock-store";
import {SettingsDialog} from "..";

const mockStore = configureStore();

const initialState = {
  board: {
    data: {
      id: "boardId",
    },
  },
};

const createSettingsDialog = () => {
  const mockedStore = mockStore(initialState);
  return (
    <Provider store={mockedStore}>
      <SettingsDialog />
    </Provider>
  );
};

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
