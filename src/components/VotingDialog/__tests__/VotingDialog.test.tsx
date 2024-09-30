import {render} from "@testing-library/react";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {ApplicationState} from "store";
import getTestParticipant from "utils/test/getTestParticipant";
import {I18nextProvider} from "react-i18next";
import {VotingDialog} from "..";
import i18nTest from "i18nTest";

const mockedUsedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

describe("VotingDialog", () => {
  const createVotingDialog = (overwrite?: Partial<ApplicationState>) => {
    return (
      <I18nextProvider i18n={i18nTest}>
        <Provider store={getTestStore(overwrite)}>
          <VotingDialog />
        </Provider>
      </I18nextProvider>
    );
  };

  beforeEach(() => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
  });

  it("should match the snapshot with no active voting", () => {
    const {container} = render(createVotingDialog({votings: {open: undefined, past: []}}), {container: global.document.querySelector("#portal")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should match the snapshot with active voting", () => {
    const {container} = render(createVotingDialog(), {container: global.document.querySelector("#portal")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should redirect if the current user isn't a moderator", () => {
    render(createVotingDialog({participants: {self: getTestParticipant({role: "PARTICIPANT"}), others: []}}), {container: global.document.querySelector("#portal")!});
    expect(mockedUsedNavigate).toHaveBeenCalledWith("..");
  });
});
