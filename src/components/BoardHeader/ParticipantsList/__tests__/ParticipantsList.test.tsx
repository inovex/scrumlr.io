import {fireEvent} from "@testing-library/react";
import {UserClientModel} from "types/user";
import {ParticipantsList} from "components/BoardHeader/ParticipantsList";
import {ActionFactory} from "store/action";
import {mocked} from "ts-jest/utils";
import {User} from "parse";
import store from "store";
import {render} from "testUtils";
import {wrapWithTestBackend} from "react-dnd-test-utils";
import {Provider} from "react-redux";
import configureStore from "redux-mock-store";

jest.mock("store", () => ({
  ...jest.requireActual("store"),
  dispatch: jest.fn(),
}));

jest.mock("parse");

const mockStore = configureStore();

const mockedUser = mocked(User, true);

describe("ParticipantsList", () => {
  const createParticipantsList = (props: {open: boolean; onClose?: () => void; currentUserIsModerator: boolean; currentUserId: string}) => {
    const initialState = {
      board: {
        data: {
          owner: "owner",
        },
      },
      users: {
        admins: [],
        basic: [],
        all: [],
      },
    };
    const mockedStore = mockStore(initialState);
    const [ParticipantsListContext] = wrapWithTestBackend(ParticipantsList);
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

    return (
      <Provider store={mockedStore}>
        <ParticipantsListContext open={props.open} onClose={() => props.onClose?.()} currentUserIsModerator={props.currentUserIsModerator} participants={users} />
      </Provider>
    );
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
    expect(container.querySelector(".toggle")).toHaveClass("toggle--active");
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
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
    const {container} = render(createParticipantsList({open: true, currentUserIsModerator: true, currentUserId: "0"}), {
      container: global.document.querySelector("#portal")!,
    });
    fireEvent.click(container.getElementsByClassName("participant__permission-toggle")[1]);
    expect(store.dispatch).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(ActionFactory.changePermission("1", true));
  });
});
