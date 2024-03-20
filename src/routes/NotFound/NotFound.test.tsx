import {render} from "testUtils";
import {NotFound} from "./NotFound";

describe("NotFound", () => {
  it("should match snapshot", () => {
    const {container} = render(<NotFound />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
