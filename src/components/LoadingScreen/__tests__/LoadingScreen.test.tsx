import {render} from "testUtils";
import {LoadingScreen} from "../LoadingScreen";

test("render loading screen", () => {
  const {container} = render(<LoadingScreen />);
  expect(container.firstChild).toMatchSnapshot();
});
