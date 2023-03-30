import {render} from "testUtils";
import {MenuBars} from "components/MenuBars";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {MockStoreEnhanced} from "redux-mock-store";
import getTestParticipant from "../../../utils/test/getTestParticipant";

const createMenuBars = (store: MockStoreEnhanced) => (
  <Provider store={store}>
    <MenuBars />
  </Provider>
);

describe("MenuBars", () => {
  test("should match snapshot", () => {
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
