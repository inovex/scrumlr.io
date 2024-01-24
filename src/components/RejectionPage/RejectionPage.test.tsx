import {screen, fireEvent, render} from "@testing-library/react";
import {BrowserRouter, MemoryRouter, Routes, Route} from "react-router-dom";
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

  it("should redirect to homepage on button click", () => {
    const {getByText} = render(
      <MemoryRouter initialEntries={["/board/test-uuid"]}>
        <Routes>
          <Route path="/board/test-uuid" element={<RejectionPage />} />
          <Route path="/" element={<div>Homepage</div>} />
        </Routes>
      </MemoryRouter>
    );

    const button = getByText("RejectionPage.button");
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.getByText("Homepage")).toBeInTheDocument();
  });
});
