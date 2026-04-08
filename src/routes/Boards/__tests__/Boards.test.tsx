import {fireEvent, screen} from "@testing-library/react";
import {render} from "testUtils";
import {Boards} from "routes/Boards/Boards";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {ApplicationState} from "store";

const mockLocation = {pathname: "/boards/templates"};

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useLocation: () => mockLocation,
    useParams: () => ({}),
    Outlet: () => null,
  };
});

describe("Boards", () => {
  beforeEach(() => {
    mockLocation.pathname = "/boards/templates";
  });

  beforeEach(() => {
    const portal = document.createElement("div");
    portal.id = "portal";
    document.body.appendChild(portal);
  });

  afterEach(() => {
    document.getElementById("portal")?.remove();
  });

  const renderBoards = (state?: Partial<ApplicationState>) =>
    render(
      <Provider store={getTestStore(state)}>
        <Boards />
      </Provider>
    );

  it("shows import button on templates view", () => {
    renderBoards();
    const importBtn = screen.getByRole("button", {name: /Import JSON/});
    expect(importBtn).toBeInTheDocument();
    expect(importBtn).not.toBeDisabled();
  });

  it("does not show import button on sessions view", () => {
    mockLocation.pathname = "/boards/sessions";
    renderBoards();
    expect(screen.queryByRole("button", {name: /Import JSON/})).not.toBeInTheDocument();
  });

  it("disables import button for anonymous users when board creation is not allowed", () => {
    renderBoards({
      auth: {user: {id: "anon", name: "Anon", isAnonymous: true}, initializationSucceeded: true},
      view: {...getTestApplicationState().view, allowAnonymousBoardCreation: false},
    });
    const importBtn = screen.getByRole("button", {name: /Import JSON/});
    expect(importBtn).toBeDisabled();
  });

  it("enables import button for authenticated users", () => {
    renderBoards({
      auth: {user: {id: "user-1", name: "User", isAnonymous: false}, initializationSucceeded: true},
    });
    expect(screen.getByRole("button", {name: /Import JSON/})).not.toBeDisabled();
  });

  it("shows import modal when import button is clicked", () => {
    renderBoards({
      auth: {user: {id: "user-1", name: "User", isAnonymous: false}, initializationSucceeded: true},
    });
    fireEvent.click(screen.getByRole("button", {name: /Import JSON/}));
    expect(screen.getByTestId("simple-modal")).toBeInTheDocument();
  });

  it("hides import modal when onClose is called", () => {
    renderBoards({
      auth: {user: {id: "user-1", name: "User", isAnonymous: false}, initializationSucceeded: true},
    });
    fireEvent.click(screen.getByRole("button", {name: /Import JSON/}));
    expect(screen.getByTestId("simple-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("simple-modal__secondary-button"));
    expect(screen.queryByTestId("simple-modal")).not.toBeInTheDocument();
  });
});
