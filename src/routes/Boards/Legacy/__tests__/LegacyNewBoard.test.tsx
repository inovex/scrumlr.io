import {render} from "testUtils";
import {LegacyNewBoard} from "../LegacyNewBoard";
import {fireEvent, screen, waitFor} from "@testing-library/react";
import {ApplicationState} from "store";
import getTestApplicationState from "utils/test/getTestApplicationState";
import getTestStore from "utils/test/getTestStore";
import {Provider} from "react-redux";
import {API} from "api";

// Mock the API
jest.mock("api", () => ({
  API: {
    createBoard: jest.fn(),
  },
}));

// Mock the navigate function
const mockNavigate = jest.fn();
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockNavigate,
}));

describe("LegacyNewBoard", () => {
  const defaultState = getTestApplicationState();

  beforeEach(() => {
    jest.clearAllMocks();
    (API.createBoard as jest.Mock).mockResolvedValue("board-id-123");
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
    const state = {
      auth: {
        user: {
          id: "user-id",
          name: "Test User",
          isAnonymous: false,
        },
      },
      view: {
        allowAnonymousBoardCreation: false,
      },
    };

    renderLegacyNewBoard(state);

    expect(screen.getByText("Choose a template")).toBeInTheDocument();
    expect(screen.getByText("Create new Board")).toBeInTheDocument();
  });

  it("should render correctly for anonymous users with board creation allowed", () => {
    const state = {
      auth: {
        user: {
          id: "anonymous-user-id",
          name: "Anonymous User",
          isAnonymous: true,
        },
        initializationSucceeded: true,
      },
      view: {
        allowAnonymousBoardCreation: true,
      },
    };

    renderLegacyNewBoard(state);

    expect(screen.getByText("Choose a template")).toBeInTheDocument();
    expect(screen.getByText("Create new Board")).toBeInTheDocument();
  });

  it("should disable create board button for anonymous users when board creation is disabled", () => {
    const state = {
      auth: {
        user: {
          id: "anonymous-user-id",
          name: "Anonymous User",
          isAnonymous: true,
        },
        initializationSucceeded: true,
      },
      view: {
        allowAnonymousBoardCreation: false,
      },
    };

    renderLegacyNewBoard(state);

    const createButton = screen.getByRole("button", {name: "Create new Board"});
    expect(createButton).toBeDisabled();
  });

  it("should show tooltip for disabled create board button for anonymous users", () => {
    const state = {
      auth: {
        user: {
          id: "anonymous-user-id",
          name: "Anonymous User",
          isAnonymous: true,
        },
        initializationSucceeded: true,
      },
      view: {
        allowAnonymousBoardCreation: false,
      },
    };

    renderLegacyNewBoard(state);

    const createButton = screen.getByRole("button", {name: "Create new Board"});
    expect(createButton).toBeDisabled();
    expect(createButton).toHaveAttribute("title", "Sign in to create a board.");
  });

  it("should disable import board button for anonymous users when board creation is disabled", () => {
    const state = {
      auth: {
        user: {
          id: "anonymous-user-id",
          name: "Anonymous User",
          isAnonymous: true,
        },
        initializationSucceeded: true,
      },
      view: {
        allowAnonymousBoardCreation: false,
      },
    };

    renderLegacyNewBoard(state);

    // Click on import file option first
    const importFileLabel = screen.getByText("Import JSON");
    fireEvent.click(importFileLabel);

    const importButton = screen.getByRole("button", {name: "Import now"});
    expect(importButton).toBeDisabled();
  });

  it("should show tooltip for disabled import board button for anonymous users", () => {
    const state = {
      auth: {
        user: {
          id: "anonymous-user-id",
          name: "Anonymous User",
          isAnonymous: true,
        },
        initializationSucceeded: true,
      },
      view: {
        allowAnonymousBoardCreation: false,
      },
    };

    renderLegacyNewBoard(state);

    // Click on import file option first
    const importFileLabel = screen.getByText("Import JSON");
    fireEvent.click(importFileLabel);

    const importButton = screen.getByRole("button", {name: "Import now"});
    expect(importButton).toBeDisabled();
    expect(importButton).toHaveAttribute("title", "Sign in to create a board.");
  });

  it("should enable create board button when template is selected and user can create boards", () => {
    const state = {
      auth: {
        user: {
          id: "user-id",
          name: "Test User",
          isAnonymous: false,
        },
      },
      view: {
        allowAnonymousBoardCreation: false,
      },
    };

    renderLegacyNewBoard(state);

    // Select a template
    const leanCoffeeOption = screen.getByDisplayValue("leanCoffee");
    fireEvent.click(leanCoffeeOption);

    const createButton = screen.getByRole("button", {name: "Create new Board"});
    expect(createButton).not.toBeDisabled();
  });

  it("should enable create board button for anonymous users when board creation is allowed and template is selected", () => {
    const state = {
      auth: {
        user: {
          id: "anonymous-user-id",
          name: "Anonymous User",
          isAnonymous: true,
        },
        initializationSucceeded: true,
      },
      view: {
        allowAnonymousBoardCreation: true,
      },
    };

    renderLegacyNewBoard(state);

    // Select a template
    const leanCoffeeOption = screen.getByDisplayValue("leanCoffee");
    fireEvent.click(leanCoffeeOption);

    const createButton = screen.getByRole("button", {name: "Create new Board"});
    expect(createButton).not.toBeDisabled();
  });

  it("should call API and navigate when creating board with allowed permissions", async () => {
    const state = {
      auth: {
        user: {
          id: "user-id",
          name: "Test User",
          isAnonymous: false,
        },
      },
      view: {
        allowAnonymousBoardCreation: false,
      },
    };

    renderLegacyNewBoard(state);

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
    const state = {
      auth: {
        user: {
          id: "anonymous-user-id",
          name: "Anonymous User",
          isAnonymous: true,
        },
        initializationSucceeded: true,
      },
      view: {
        allowAnonymousBoardCreation: false,
      },
    };

    renderLegacyNewBoard(state);

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
    const state = {
      auth: {
        user: {
          id: "user-id",
          name: "Test User",
          isAnonymous: false,
        },
      },
      view: {
        allowAnonymousBoardCreation: false,
      },
    };

    renderLegacyNewBoard(state);

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
    const state = {
      auth: {
        user: {
          id: "user-id",
          name: "Test User",
          isAnonymous: false,
        },
      },
      view: {
        allowAnonymousBoardCreation: false,
      },
    };

    renderLegacyNewBoard(state);

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
    const state = {
      auth: {
        user: {
          id: "anonymous-user-id",
          name: "Anonymous User",
          isAnonymous: true,
        },
        initializationSucceeded: true,
      },
      view: {
        allowAnonymousBoardCreation: false,
      },
    };

    renderLegacyNewBoard(state);

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
