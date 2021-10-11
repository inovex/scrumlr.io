import {render} from "@testing-library/react";
import {LoadingScreen} from "../LoadingScreen";

test("render loading screen", () => {
  const {container} = render(<LoadingScreen />);
  expect(container.firstChild).toMatchSnapshot();
});
