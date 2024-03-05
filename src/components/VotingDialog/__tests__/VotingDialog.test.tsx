import {fireEvent, render, screen} from "@testing-library/react";
import {Provider} from "react-redux";
import {Actions} from "store/action";
import store from "store";
import getTestStore from "utils/test/getTestStore";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {ApplicationState} from "types";
import getTestParticipant from "utils/test/getTestParticipant";
import {I18nextProvider} from "react-i18next";
import {VotingDialog} from "..";
import i18nTest from "i18nTest";

const mockedUsedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

const storeDispatchSpy = jest.spyOn(store, "dispatch");

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

  xit("should dispatch to store correctly on start voting button click", () => {
    render(createVotingDialog({votings: {open: undefined, past: []}}), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("voting-dialog__start-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(Actions.createVoting({voteLimit: 5, showVotesOfOthers: true, allowMultipleVotes: false}));
  });

  xit("should dispatch to store correctly on start voting button click with custom vote configuration", () => {
    render(createVotingDialog({votings: {open: undefined, past: []}}), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("voting-dialog__cumulative-voting-button"));
    fireEvent.click(screen.getByTestId("voting-dialog__anonymous-voting-button"));
    fireEvent.click(screen.getByTestId("voting-dialog__plus-button"));
    fireEvent.click(screen.getByTestId("voting-dialog__start-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(Actions.createVoting({voteLimit: 6, showVotesOfOthers: false, allowMultipleVotes: true}));
  });

  it("should dispatch to store correctly on stop voting button click", () => {
    render(createVotingDialog(), {container: global.document.querySelector("#portal")!});
    fireEvent.click(screen.getByTestId("voting-dialog__stop-button"));
    expect(storeDispatchSpy).toHaveBeenCalledWith(Actions.closeVoting(getTestApplicationState().votings.open!.id));
  });
});
