import {render} from "testUtils";
import {NotFound} from "..";

describe("NotFound", () => {
  test("should render correctly", () => {
    const {container} = render(<NotFound />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
