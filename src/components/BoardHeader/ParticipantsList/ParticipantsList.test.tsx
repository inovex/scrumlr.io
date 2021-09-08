import {render} from "@testing-library/react";
import {ParticipantsList} from ".";

describe("ParticipantsList", () => {
  describe("should render correctly", () => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);

    test("on open", () => {
      const {container} = render(<ParticipantsList open onClose={() => null} participants={[1, 2, 3].map((_, i) => ({id: i, displayName: `Participant ${i}`}))} />, {
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
