import {render, fireEvent} from "@testing-library/react";
import {UserClientModel} from "types/user";
import Parse from "parse";
import * as store from "store";
import {ParticipantsList} from ".";

describe("ParticipantsList", () => {
  beforeAll(() => {
    store.useAppSelector = jest.fn();
  });

  const createParticipantsList = (props: {open: boolean; onClose?: () => void; currentUserIsModerator: boolean; currentUserId: string}) => {
    const userAdmin: UserClientModel = {
      id: "0",
      displayName: "Adam Admin",
      admin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      online: true,
    };
    const userParticipant: UserClientModel = {
      id: "1",
      displayName: "Patty Participant",
      admin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      online: true,
    };
    const users = [userAdmin, userParticipant];

    Parse.User.current = jest.fn(() => ({id: props.currentUserId}));

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
    expect(container.querySelector(".participants__list-item")!.childNodes[1]).toHaveClass("toggle-button toggle-button--right participant__permission-toggle");
  });

  test("Don't show toggleButton as participant without moderator rights", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
    const {container} = render(createParticipantsList({open: true, currentUserIsModerator: false, currentUserId: "0"}), {
      container: global.document.querySelector("#portal")!,
    });
    expect(container.querySelector(".participants__list-item")!.firstChild).toHaveClass("participants-avatar");
    expect(container.querySelector(".participants__list-item")!.childElementCount).toBe(1);
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
    expect(container.querySelector(".participants__list")!.childNodes[1]).toHaveTextContent("PP");
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
      expect(container.querySelector(".participants__list")!.childNodes[1]).toHaveTextContent("PP");
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
      expect(container.querySelector(".participants__list")!.childNodes[1]).toHaveTextContent("AA");
      expect(container.querySelector(".participants__list")!.childElementCount).toBe(3);
    });
  });

  // const permissionSpy = jest.spyOn(UsersActionFactory, "changePermission");
  // test("Permission toggle calls store.dispatch", () => {
  //   const portal = global.document.createElement("div");
  //   portal.setAttribute("id", "portal");
  //   global.document.querySelector("body")!.appendChild(portal);
  //   const {container} = render(createParticipantsList({open: true, currentUserIsModerator: true, currentUserId: "0"}), {
  //     container: global.document.querySelector("#portal")!,
  //   });
  //   expect(container.querySelector(".participants__list")!.childNodes[2].childNodes[1]).toHaveClass("toggle-button--left");
  //   fireEvent.click(container.querySelector(".participants__list")!.childNodes[1].childNodes[1]);
  //   expect(permissionSpy).toHaveBeenCalledWith("1", true);
  // });
});
