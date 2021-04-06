import {render} from "@testing-library/react";
import ErrorPage from "../ErrorPage";

test("render loading screen", () => {
  const {container} = render(<ErrorPage errorMessage="Some error occurred" />);
  expect(container.firstChild).toMatchSnapshot();
});
