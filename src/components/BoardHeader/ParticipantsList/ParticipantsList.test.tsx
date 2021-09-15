import {render, fireEvent} from "@testing-library/react";
import {ActionFactory} from "store/action";
import {UserClientModel} from "types/user";
import Parse from "parse";
import * as store from "store";
import {ParticipantsList} from ".";

describe("ParticipantsList", () => {
  beforeAll(() => {
    // @ts-ignore
    store.useAppSelector = jest.fn();
  });

  const createParticipantsList = (props: {open: boolean; onClose?: () => void; currentUserIsModerator: boolean; numberOfParticipants?: number}) => (
    <ParticipantsList
      open={props.open}
      onClose={() => props.onClose?.()}
      currentUserIsModerator={props.currentUserIsModerator}
      participants={[...Array(props.numberOfParticipants ?? 0).keys()].map((n) => ({id: `${0}`, displayName: `Participant ${n}`} as unknown as UserClientModel))}
    />
  );

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
      store.default.dispatch = jest.fn();
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);
      const {container} = render(createParticipantsList({open: true, currentUserIsModerator: true, numberOfParticipants: 3}), {
        container: global.document.querySelector("#portal")!,
      });
      fireEvent.click(container.getElementsByClassName("participant__permission-toggle")[0]);
      expect(store.default.dispatch).toHaveBeenCalled();
      expect(store.default.dispatch).toHaveBeenCalledWith(ActionFactory.changePermission("0", true));
    });

    test("should disable permission toggle of own user", () => {
      // @ts-ignore
      Parse.User.current = jest.fn(() => ({id: "0"}));
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);
      const {container} = render(createParticipantsList({open: true, currentUserIsModerator: true, numberOfParticipants: 3}), {
        container: global.document.querySelector("#portal")!,
      });
      expect(container.getElementsByClassName("participant__permission-toggle")[0]).toHaveAttribute("disabled");
    });

    test("should disable permission toggle of board creator", () => {
      // @ts-ignore
      store.useAppSelector = jest.fn(() => "0");
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);
      const {container} = render(createParticipantsList({open: true, currentUserIsModerator: true, numberOfParticipants: 3}), {
        container: global.document.querySelector("#portal")!,
      });
      expect(container.getElementsByClassName("participant__permission-toggle")[0]).toHaveAttribute("disabled");
    });
  });
});
