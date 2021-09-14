import {render, fireEvent} from "@testing-library/react";
import {ParticipantsList} from ".";

describe("ParticipantsList", () => {
  describe("should render correctly", () => {
    test("on filtered participants", () => {
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);
      const {container} = render(<ParticipantsList open onClose={() => null} participants={[...Array(3).keys()].map((n) => ({id: n, displayName: `Participant ${n}`}))} />, {
        container: global.document.querySelector("#portal")!,
      });
      fireEvent.change(container.querySelector("input")!, {target: {value: "Participant 0"}});
      expect(container).toMatchSnapshot();
    });

    test("on open", () => {
      const portal = global.document.createElement("div");
      portal.setAttribute("id", "portal");
      global.document.querySelector("body")!.appendChild(portal);
      const {container} = render(<ParticipantsList open onClose={() => null} participants={[...Array(3).keys()].map((n) => ({id: n, displayName: `Participant ${n}`}))} />, {
        container: global.document.querySelector("#portal")!,
      });
      expect(container).toMatchSnapshot();
    });

    test("on close", () => {
      const {container} = render(<ParticipantsList open={false} onClose={() => null} participants={[]} />, {container: global.document.querySelector("#portal")!});
      expect(container).toMatchSnapshot();
    });
  });
});
