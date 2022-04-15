import {fireEvent} from "@testing-library/react";
import {ParticipantsList} from "components/BoardHeader/ParticipantsList";
import {Actions} from "store/action";
import {render} from "testUtils";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import * as redux from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {ApplicationState} from "types";
import getTestParticipant from "utils/test/getTestParticipant";

describe("ParticipantsList", () => {
  const createParticipantsList = (open: boolean, overwrite?: Partial<ApplicationState>) => {
    const [ParticipantsListContext] = wrapWithTestBackend(ParticipantsList);

    return (
      <redux.Provider store={getTestStore(overwrite)}>
        <ParticipantsListContext open={open} onClose={() => null} />
      </redux.Provider>
    );
  };

  test("Show nothing because portal is closed", () => {
    const {container} = render(createParticipantsList(false), {container: global.document.querySelector("#portal")!});
    expect(container).toBeEmptyDOMElement();
  });

  beforeEach(() => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
  });

  test("Show correct number of current participants", () => {
    const {container} = render(createParticipantsList(true), {
      container: global.document.querySelector("#portal")!,
    });
    expect(container.querySelector(".participants__header-number")).toHaveTextContent("2");
  });

  test("show toggleButton as owner", () => {
    const {container} = render(createParticipantsList(true), {
      container: global.document.querySelector("#portal")!,
    });
    expect(container.getElementsByClassName("participant__permission-toggle").length).not.toBe(0);
  });

  test("show toggleButton as moderator", () => {
    const {container} = render(createParticipantsList(true, {participants: {self: getTestParticipant({role: "MODERATOR"}), others: [getTestParticipant()]}}), {
      container: global.document.querySelector("#portal")!,
    });
    expect(container.getElementsByClassName("participant__permission-toggle").length).not.toBe(0);
  });

  test("don't show toggleButton as participant", () => {
    const {container} = render(createParticipantsList(true, {participants: {self: getTestParticipant({role: "PARTICIPANT"}), others: [getTestParticipant()]}}), {
      container: global.document.querySelector("#portal")!,
    });
    expect(container.getElementsByClassName("participant__permission-toggle").length).toBe(0);
  });

  test("Show just the participants that's is looked for with correct initials", () => {
    const {container} = render(createParticipantsList(true), {
      container: global.document.querySelector("#portal")!,
    });
    fireEvent.change(container.querySelector(".participants__header-input")!, {target: {value: "test-participants-others-user-name-1"}});
    expect(container.querySelector(".participants__list")!.firstChild).toHaveClass("list__header");
    expect(container.querySelector(".participants__list")!.childElementCount).toBe(2);
  });

  test("Permission toggle calls store.dispatch", () => {
    const useDispatchSpy = jest.spyOn(redux, "useDispatch");
    const dispatchMock = jest.fn();
    useDispatchSpy.mockReturnValue(dispatchMock);
    const {container} = render(createParticipantsList(true), {
      container: global.document.querySelector("#portal")!,
    });
    fireEvent.click(container.getElementsByClassName("participant__permission-toggle")[1]);
    expect(dispatchMock).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith(Actions.changePermission("test-participants-others-user-id-1", false));
  });
});
