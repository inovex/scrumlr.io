import {render} from "@testing-library/react";
import {BrowserRouter} from "react-router-dom";
import {RejectionPage} from "./RejectionPage";

describe("RejectionPage", () => {
  it("should match snapshot", () => {
    const {container} = render(
      <BrowserRouter>
        <RejectionPage />
      </BrowserRouter>
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
