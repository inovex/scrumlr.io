import "../matchMedia.mock";
import {Provider} from "react-redux";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {Appearance} from "../Appearance";
import {getByLabelText} from "@testing-library/dom";
import i18n from "i18nTest";
import {within} from "@testing-library/react";
import {t} from "i18next";

const createAppearance = () => (
  <Provider store={getTestStore()}>
    <Appearance />
  </Provider>
);

describe("Appearance", () => {
  test("should render all Settings correctly with Snowfall", () => {
    jest.useFakeTimers().setSystemTime(new Date(2025, 11, 24)); // Christmas!
    const {container} = render(createAppearance());
    expect(container.firstChild).toMatchSnapshot();
    expect(within(container.getElementsByClassName("appearance-container")[0] as HTMLDivElement).queryByLabelText(t("Appearance.showSnowfall"))).toBeInTheDocument();
  });

  test("should render all Settings correctly without Snowfall", () => {
    jest.useFakeTimers().setSystemTime(new Date(2025, 5, 7)); // my birthday!
    const {container} = render(createAppearance());
    expect(container.firstChild).toMatchSnapshot();
    expect(within(container.getElementsByClassName("appearance-container")[0] as HTMLDivElement).queryByLabelText(t("Appearance.showSnowfall"))).not.toBeInTheDocument();
  });

  test("should have a notifications toggle", () => {
    const {container} = render(createAppearance());
    expect(getByLabelText(container, i18n.t("Appearance.showHotkeyNotifications"))).toBeInTheDocument();
  });
});
