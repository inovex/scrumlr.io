import {render} from "@testing-library/react";
import {Provider} from "react-redux";
import {store} from "store";
import getTestStore from "utils/test/getTestStore";
import getTestParticipant from "utils/test/getTestParticipant";
import i18nTest from "i18nTest";
import {I18nextProvider} from "react-i18next";
import {TimerDialog} from "..";

const mockedUsedNavigate = jest.fn();
jest.spyOn(store, "dispatch");
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockedUsedNavigate,
}));

const createTimerDialog = (isParticipant?: boolean) => (
  <I18nextProvider i18n={i18nTest}>
    <Provider store={getTestStore({participants: {self: getTestParticipant({role: isParticipant ? "PARTICIPANT" : "MODERATOR"}), others: []}})}>
      <TimerDialog />
    </Provider>
  </I18nextProvider>
);

describe("TimerDialog", () => {
  beforeEach(() => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")?.appendChild(portal);
  });

  it("should match the snapshot", () => {
    const {container} = render(createTimerDialog(), {container: global.document.querySelector("#portal")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should redirect if the current user isn't a moderator", () => {
    render(createTimerDialog(true), {container: global.document.querySelector("#portal")!});
    expect(mockedUsedNavigate).toHaveBeenCalledWith("..");
  });
});
