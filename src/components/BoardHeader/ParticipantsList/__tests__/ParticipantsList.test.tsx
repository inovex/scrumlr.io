import {render, fireEvent} from "@testing-library/react";
import {UserClientModel} from "types/user";
import {useAppSelector} from "store";
import {ParticipantsList} from "components/BoardHeader/ParticipantsList";
import {ActionFactory} from "store/action";
import {mocked} from "ts-jest/utils";
import {User} from "parse";
import * as store from "store";

jest.mock("store");
jest.mock("parse");

const mockedStore = mocked(store);
const mockedUseAppSelector = mocked(useAppSelector);
const mockedUser = mocked(User, true);

describe("ParticipantsList", () => {
  beforeAll(() => {
    mockedUseAppSelector.mockResolvedValue({} as never);
  });

  const createParticipantsList = (props: {open: boolean; onClose?: () => void; currentUserIsModerator: boolean; currentUserId: string}) => {
    const userAdmin: UserClientModel = {
      id: "0",
      displayName: "Adam Admin",
      admin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      online: true,
      ready: false,
    };
    const userParticipant: UserClientModel = {
      id: "1",
      displayName: "Patty Participant",
      admin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      online: true,
      ready: false,
    };
    const users = [userAdmin, userParticipant];

    mockedUser.current = jest.fn(() => ({id: props.currentUserId} as never));

    return <ParticipantsList open={props.open} onClose={() => props.onClose?.()} currentUserIsModerator={props.currentUserIsModerator} participants={users} />;
  };

  test("Show nothing because portal is closed", () => {
    const {container} = render(createParticipantsList({open: false, currentUserIsModerator: false, currentUserId: "0"}), {container: global.document.querySelector("#portal")!});
    expect(container).toBeEmptyDOMElement();
  });

  test("Show correct number of current participants", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
    const {container} = render(createParticipantsList({open: true, currentUserIsModerator: true, currentUserId: "0"}), {
      container: global.document.querySelector("#portal")!,
    });
    expect(container.querySelector(".participants__header-number")).toHaveTextContent("2");
  });

  test("Show toggleButton as moderator", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
    const {container} = render(createParticipantsList({open: true, currentUserIsModerator: true, currentUserId: "0"}), {
      container: global.document.querySelector("#portal")!,
    });
    expect(container.querySelector(".participant")!.childNodes[1]).toHaveClass("toggle-button toggle-button--right participant__permission-toggle");
  });

  test("Don't show toggleButton as participant without moderator rights", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
    const {container} = render(createParticipantsList({open: true, currentUserIsModerator: false, currentUserId: "0"}), {
      container: global.document.querySelector("#portal")!,
    });
    expect(container.querySelector(".participant")!.childElementCount).toBe(1);
  });

  test("Show just the participants that's is looked for with correct initials", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
    const {container} = render(createParticipantsList({open: true, currentUserIsModerator: false, currentUserId: "0"}), {
      container: global.document.querySelector("#portal")!,
    });
    fireEvent.change(container.querySelector(".participants__header-input")!, {target: {value: "Patty Participant"}});
    expect(container.querySelector(".participants__list")!.firstChild).toHaveClass("list__header");
    expect(container.querySelector(".participants__list")!.childElementCount).toBe(2);
  });

  describe("Show correct user always on top of list", () => {
    test("Patty Participant", () => {
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);
      const {container} = render(createParticipantsList({open: true, currentUserIsModerator: false, currentUserId: "1"}), {
        container: global.document.querySelector("#portal")!,
      });
      expect(container.querySelector(".participants__list")!.firstChild).toHaveClass("list__header");
      expect(container.querySelector(".participants__list")!.childElementCount).toBe(3);
    });

    test("Adam Admin", () => {
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);
      const {container} = render(createParticipantsList({open: true, currentUserIsModerator: false, currentUserId: "0"}), {
        container: global.document.querySelector("#portal")!,
      });
      expect(container.querySelector(".participants__list")!.firstChild).toHaveClass("list__header");
      expect(container.querySelector(".participants__list")!.childElementCount).toBe(3);
    });
  });

  test("Permission toggle calls store.dispatch", () => {
    store.default.dispatch = jest.fn();
    mockedStore.default.dispatch = jest.fn();

    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
    const {container} = render(createParticipantsList({open: true, currentUserIsModerator: true, currentUserId: "0"}), {
      container: global.document.querySelector("#portal")!,
    });
    fireEvent.click(container.getElementsByClassName("participant__permission-toggle")[1]);
    expect(mockedStore.default.dispatch).toHaveBeenCalled();
    expect(mockedStore.default.dispatch).toHaveBeenCalledWith(ActionFactory.changePermission("1", true));
  });
});
