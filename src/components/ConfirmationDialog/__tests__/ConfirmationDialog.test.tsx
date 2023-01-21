import {render} from "testUtils";
import {ConfirmationDialog} from "../ConfirmationDialog";

describe("<ConfirmationDialog />", () => {
  beforeEach(() => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
  });

  test("snapshot test", () => {
    const {container} = render(<ConfirmationDialog title="headline" onAcceptLabel="accept" onDeclineLabel="decline" onAccept={jest.fn()} onDecline={jest.fn()} />, {
      container: global.document.querySelector("#portal")!,
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
