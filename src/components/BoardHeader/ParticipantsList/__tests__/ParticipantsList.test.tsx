import {render, fireEvent} from "@testing-library/react";
import {ActionFactory} from "store/action";
import {UserClientModel} from "types/user";
import {User} from "parse";
import {ParticipantsList} from "components/BoardHeader/ParticipantsList";
import {mocked} from "ts-jest/utils";
import * as store from "store";
import {useAppSelector} from "store";

jest.mock("store");
jest.mock("parse");

const mockedStore = mocked(store);
const mockedUseAppSelector = mocked(useAppSelector);
const mockedUser = mocked(User, true);

const createParticipantsList = (props: {open: boolean; onClose?: () => void; currentUserIsModerator: boolean; numberOfParticipants?: number}) => (
  <ParticipantsList
    open={props.open}
    onClose={() => props.onClose?.()}
    currentUserIsModerator={props.currentUserIsModerator}
    participants={[...Array(props.numberOfParticipants ?? 0).keys()].map((n) => ({id: `${n}`, displayName: `Participant ${n}`} as unknown as UserClientModel))}
  />
);

const createPortalAndParticipants = () => {
  const portal = global.document.createElement("div");
  portal.setAttribute("id", "portal");
  global.document.querySelector("body")!.appendChild(portal);
  return render(createParticipantsList({open: true, currentUserIsModerator: true, numberOfParticipants: 3}), {
    container: global.document.querySelector("#portal")!,
  });
};

describe("ParticipantsList", () => {
  beforeAll(() => {
    mockedUseAppSelector.mockResolvedValue({} as never);
  });

  describe("should render correctly", () => {
    test("on filtered participants", () => {
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);
      const {container} = render(createParticipantsList({open: true, currentUserIsModerator: false, numberOfParticipants: 3}), {
        container: global.document.querySelector("#portal")!,
      });
      fireEvent.change(container.querySelector("input")!, {target: {value: "Participant 0"}});
      expect(container).toMatchSnapshot();
    });

    test("as moderator", () => {
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);
      const {container} = render(createParticipantsList({open: true, currentUserIsModerator: true, numberOfParticipants: 3}), {
        container: global.document.querySelector("#portal")!,
      });
      expect(container).toMatchSnapshot();
    });

    test("on open", () => {
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);
      const {container} = render(createParticipantsList({open: true, currentUserIsModerator: false, numberOfParticipants: 3}), {
        container: global.document.querySelector("#portal")!,
      });
      expect(container).toMatchSnapshot();
    });

    test("on close", () => {
      const {container} = render(createParticipantsList({open: false, currentUserIsModerator: false}), {container: global.document.querySelector("#portal")!});
      expect(container).toMatchSnapshot();
    });

    test("permission toggle should call store.dispatch", () => {
      mockedStore.default.dispatch = jest.fn();
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);
      const {container} = render(createParticipantsList({open: true, currentUserIsModerator: true, numberOfParticipants: 3}), {
        container: global.document.querySelector("#portal")!,
      });
      fireEvent.click(container.getElementsByClassName("participant__permission-toggle")[0]);
      expect(mockedStore.default.dispatch).toHaveBeenCalled();
      expect(mockedStore.default.dispatch).toHaveBeenCalledWith(ActionFactory.changePermission("0", true));
    });

    test("should disable permission toggle of own user", () => {
      mockedUser.current = jest.fn(() => ({id: "0"} as never));
      const {container} = createPortalAndParticipants();
      expect(container.getElementsByClassName("participant__permission-toggle")[0]).toHaveAttribute("disabled");
    });

    test("should disable permission toggle of board creator", () => {
      mockedUseAppSelector.mockImplementation(() => "0" as never);
      const {container} = createPortalAndParticipants();
      expect(container.getElementsByClassName("participant__permission-toggle")[0]).toHaveAttribute("disabled");
    });
  });
});
