import {render} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import {NotFound} from "./NotFound";

describe("NotFound", () => {
  it("should match snapshot", () => {
    const {container} = render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
