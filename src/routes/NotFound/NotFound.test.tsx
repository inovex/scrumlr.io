import {screen, fireEvent, render} from "@testing-library/react";
import {BrowserRouter, MemoryRouter, Routes, Route} from "react-router-dom";
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

  it("should redirect to homepage on button click", () => {
    const {getByText} = render(
      <MemoryRouter initialEntries={["/non-existing-route"]}>
        <Routes>
          <Route path="/non-existing-route" element={<NotFound />} />
          <Route path="/" element={<div>Homepage</div>} />
        </Routes>
      </MemoryRouter>
    );

    const button = getByText("NotFoundPage.navigateHome");
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.getByText("Homepage")).toBeInTheDocument();
  });
});
