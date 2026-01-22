import {render} from "testUtils";
import {LegacyNewBoard} from "../LegacyNewBoard";
import {fireEvent, screen, waitFor} from "@testing-library/react";
import {ApplicationState} from "store";
import getTestApplicationState from "utils/test/getTestApplicationState";
import getTestStore from "utils/test/getTestStore";
import {Provider} from "react-redux";
import {API} from "api";
import {resources} from "i18nTest";
import {Mock} from "vitest";

// Mock the API
vi.mock("api", async () => ({
  API: {
    createBoard: vi.fn(),
  },
}));

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const getTestState = (isAnonymous: boolean, allowAnonymousBoardCreation: boolean) =>
  getTestApplicationState({
    auth: {
      ...getTestApplicationState().auth,
      user: {
        ...getTestApplicationState().auth.user!,
        isAnonymous,
      },
    },
    view: {...getTestApplicationState().view, allowAnonymousBoardCreation},
  });

describe("LegacyNewBoard", () => {
  const defaultState = getTestApplicationState();
  const signInToCreateBoardText = resources.en.translation.Templates.TemplateCard.signInToCreateBoards;

  beforeEach(() => {
    vi.clearAllMocks();
    (API.createBoard as Mock).mockResolvedValue("board-id-123");
  });

  const renderLegacyNewBoard = (state?: Partial<ApplicationState>) => {
    const createLegacyNewBoardWithState = (
      <Provider store={getTestStore(state)}>
        <LegacyNewBoard />
      </Provider>
    );

    return render(createLegacyNewBoardWithState);
  };

  it("should render correctly for authenticated users", () => {
    const testState = getTestState(false, false);
    renderLegacyNewBoard(testState);

    expect(screen.getByText("Choose a template")).toBeInTheDocument();
    expect(screen.getByText("Create new Board")).toBeInTheDocument();
  });

  it("should render correctly for anonymous users with board creation allowed", () => {
    const testState = getTestState(true, true);
    renderLegacyNewBoard(testState);

    expect(screen.getByText("Choose a template")).toBeInTheDocument();
    expect(screen.getByText("Create new Board")).toBeInTheDocument();
  });

  it("should disable create board button for anonymous users when board creation is disabled", () => {
    const testState = getTestState(true, false);
    renderLegacyNewBoard(testState);

    const createButton = screen.getByRole("button", {name: "Create new Board"});
    expect(createButton).toBeDisabled();
  });

  it("should show tooltip for disabled create board button for anonymous users", () => {
    const testState = getTestState(true, false);
    renderLegacyNewBoard(testState);

    const createButton = screen.getByRole("button", {name: "Create new Board"});
    expect(createButton).toBeDisabled();
    expect(createButton).toHaveAttribute("title", signInToCreateBoardText);
  });

  it("should disable import board button for anonymous users when board creation is disabled", () => {
    const testState = getTestState(true, false);
    renderLegacyNewBoard(testState);

    // Click on import file option first
    const importFileLabel = screen.getByText("Import JSON");
    fireEvent.click(importFileLabel);

    const importButton = screen.getByRole("button", {name: "Import now"});
    expect(importButton).toBeDisabled();
  });

  it("should show tooltip for disabled import board button for anonymous users", () => {
    const testState = getTestState(true, false);
    renderLegacyNewBoard(testState);

    // Click on import file option first
    const importFileLabel = screen.getByText("Import JSON");
    fireEvent.click(importFileLabel);

    const importButton = screen.getByRole("button", {name: "Import now"});
    expect(importButton).toBeDisabled();
    expect(importButton).toHaveAttribute("title", signInToCreateBoardText);
  });

  it("should enable create board button when template is selected and user can create boards", () => {
    const testState = getTestState(false, false);
    renderLegacyNewBoard(testState);

    // Select a template
    const leanCoffeeOption = screen.getByDisplayValue("leanCoffee");
    fireEvent.click(leanCoffeeOption);

    const createButton = screen.getByRole("button", {name: "Create new Board"});
    expect(createButton).not.toBeDisabled();
  });

  it("should enable create board button for anonymous users when board creation is allowed and template is selected", () => {
    const testState = getTestState(true, true);
    renderLegacyNewBoard(testState);

    // Select a template
    const leanCoffeeOption = screen.getByDisplayValue("leanCoffee");
    fireEvent.click(leanCoffeeOption);

    const createButton = screen.getByRole("button", {name: "Create new Board"});
    expect(createButton).not.toBeDisabled();
  });

  it("should call API and navigate when creating board with allowed permissions", async () => {
    const testState = getTestState(false, false);
    renderLegacyNewBoard(testState);

    // Select a template
    const leanCoffeeOption = screen.getByDisplayValue("leanCoffee");
    fireEvent.click(leanCoffeeOption);

    const createButton = screen.getByRole("button", {name: "Create new Board"});
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(API.createBoard).toHaveBeenCalledWith(undefined, {policy: "PUBLIC"}, expect.any(Array));
      expect(mockNavigate).toHaveBeenCalledWith("/board/board-id-123");
    });
  });

  it("should not call API when creating board with disabled permissions", async () => {
    const testState = getTestState(true, false);
    renderLegacyNewBoard(testState);

    // Select a template
    const leanCoffeeOption = screen.getByDisplayValue("leanCoffee");
    fireEvent.click(leanCoffeeOption);

    const createButton = screen.getByRole("button", {name: "Create new Board"});

    // Button should be disabled because canCreateBoard is false
    expect(createButton).toBeDisabled();

    // Try to click the disabled button
    fireEvent.click(createButton);

    // Since the button is disabled, API should not be called
    await waitFor(() => {
      expect(API.createBoard).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it("should handle extended configuration mode", () => {
    const testState = getTestState(false, false);
    renderLegacyNewBoard(testState);

    // Select a template first to enable extended configuration
    const leanCoffeeOption = screen.getByDisplayValue("leanCoffee");
    fireEvent.click(leanCoffeeOption);

    // Click extended configuration button
    const extendedConfigButton = screen.getByRole("button", {name: "Extended configuration"});
    fireEvent.click(extendedConfigButton);

    expect(screen.getByText("Extended configuration")).toBeInTheDocument();
    expect(screen.getByText("Board name")).toBeInTheDocument();
  });

  it("should switch between basic and extended configuration", () => {
    const testState = getTestState(false, false);
    renderLegacyNewBoard(testState);

    // Select a template first
    const leanCoffeeOption = screen.getByDisplayValue("leanCoffee");
    fireEvent.click(leanCoffeeOption);

    // Go to extended configuration
    const extendedConfigButton = screen.getByRole("button", {name: "Extended configuration"});
    fireEvent.click(extendedConfigButton);

    expect(screen.getByText("Extended configuration")).toBeInTheDocument();

    // Go back to basic configuration
    const basicConfigButton = screen.getByRole("button", {name: "Template selection"});
    fireEvent.click(basicConfigButton);

    expect(screen.getByText("Choose a template")).toBeInTheDocument();
  });

  it("should show correct disabled state logic for create button with all conditions", () => {
    const testState = getTestState(true, false);
    renderLegacyNewBoard(testState);

    const createButton = screen.getByRole("button", {name: "Create new Board"});

    // Should be disabled when: !canCreateBoard (true) || !columnTemplate (true) || (passphrase conditions)
    expect(createButton).toBeDisabled();

    // Even if we select a template, should still be disabled due to !canCreateBoard
    const leanCoffeeOption = screen.getByDisplayValue("leanCoffee");
    fireEvent.click(leanCoffeeOption);

    // After selecting template, button should still be disabled because !canCreateBoard is true
    expect(createButton).toBeDisabled();
  });
});
