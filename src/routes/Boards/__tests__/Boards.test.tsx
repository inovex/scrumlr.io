import {fireEvent, screen} from "@testing-library/react";
import {render} from "testUtils";
import {Boards} from "routes/Boards/Boards";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import getTestApplicationState from "utils/test/getTestApplicationState";
import {ApplicationState} from "store";
import {resources} from "i18nTest";

const mockLocation = {pathname: "/boards/templates"};

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useLocation: () => mockLocation,
  useParams: () => ({}),
  Outlet: () => null,
}));

// Mock getTemplates to return a proper thunk that dispatches fulfilled with an empty list.
// This prevents the templates reducer from crashing on a real API call during render.
jest.mock("store/features/templates/thunks", () => {
  const actual = jest.requireActual("store/features/templates/thunks");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockGetTemplates: any = () => (dispatch: any) => {
    dispatch({type: actual.getTemplates.fulfilled.type, payload: []});
  };
  mockGetTemplates.fulfilled = actual.getTemplates.fulfilled;
  mockGetTemplates.pending = actual.getTemplates.pending;
  mockGetTemplates.rejected = actual.getTemplates.rejected;
  mockGetTemplates.typePrefix = actual.getTemplates.typePrefix;
  return {...actual, getTemplates: mockGetTemplates};
});

jest.mock("components/ImportBoard", () => ({
  ImportBoard: ({onClose}: {onClose: () => void}) => (
    <div data-testid="import-board-modal">
      <button onClick={onClose}>Close import modal</button>
    </div>
  ),
}));

describe("Boards", () => {
  const signInText = resources.en.translation.Templates.TemplateCard.signInToCreateBoards;

  beforeEach(() => {
    mockLocation.pathname = "/boards/templates";
  });

  const renderBoards = (state?: Partial<ApplicationState>) =>
    render(
      <Provider store={getTestStore(state)}>
        <Boards />
      </Provider>
    );

  it("shows import button on templates view", () => {
    renderBoards();
    expect(screen.getByRole("button", {name: /Import JSON/})).toBeInTheDocument();
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
    expect(importBtn).toHaveAttribute("title", signInText);
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
    expect(screen.getByTestId("import-board-modal")).toBeInTheDocument();
  });

  it("hides import modal when onClose is called", () => {
    renderBoards({
      auth: {user: {id: "user-1", name: "User", isAnonymous: false}, initializationSucceeded: true},
    });
    fireEvent.click(screen.getByRole("button", {name: /Import JSON/}));
    expect(screen.getByTestId("import-board-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "Close import modal"}));
    expect(screen.queryByTestId("import-board-modal")).not.toBeInTheDocument();
  });
});
