import {render} from "testUtils";
import {RejectionPage} from "./RejectionPage";

describe("RejectionPage", () => {
  it("should match snapshot", () => {
    const {container} = render(<RejectionPage />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it.todo("should redirect to homepage on button click");
});
