import {render} from "testUtils";
import {RejectionPage} from "./RejectionPage";

describe("RejectionPage", () => {
  it("should match snapshot", () => {
    const {container} = render(<RejectionPage status="rejected" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
