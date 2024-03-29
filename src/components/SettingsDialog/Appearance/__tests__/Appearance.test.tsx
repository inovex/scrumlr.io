import "../matchMedia.mock";
import {Provider} from "react-redux";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {Appearance} from "../Appearance";
import {getByLabelText} from "@testing-library/dom";
import i18n from "i18nTest";

const createAppearance = () => (
  <Provider store={getTestStore()}>
    <Appearance />
  </Provider>
);

describe("Appearance", () => {
  test("should render all Settings correctly", () => {
    const {container} = render(createAppearance());
    expect(container.firstChild).toMatchSnapshot();
  });

  test("should have a notifications toggle", () => {
    const {container} = render(createAppearance());
    expect(getByLabelText(container, i18n.t("Appearance.showHotkeyNotifications"))).toBeInTheDocument();
  });
});
