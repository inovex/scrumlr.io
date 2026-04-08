import {fireEvent, screen, waitFor} from "@testing-library/react";
import {renderWithContext} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {Provider} from "react-redux";
import {BoardSettings} from "../BoardSettings";
import * as boardThunks from "store/features/board/thunks";
import {Toast} from "utils/Toast";
import {GeneralSettingsIcon} from "components/Icon";
import {MenuItemConfig} from "constants/settings";
import {vi} from "vitest";

vi.mock("utils/Toast", () => ({
  Toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const boardMenuContext: MenuItemConfig = {
  localizationKey: "BoardSettings",
  location: "board",
  isModeratorOnly: true,
  color: "backlog-blue",
  icon: GeneralSettingsIcon,
};

const renderBoardSettings = (storeOverrides?: Parameters<typeof getTestStore>[0]) => {
  const store = getTestStore(storeOverrides);
  return renderWithContext(
    <Provider store={store}>
      <BoardSettings />
    </Provider>,
    {context: boardMenuContext}
  );
};

describe("BoardSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(boardThunks, "editBoard").mockReturnValue({type: "board/editBoard"} as any);
    Object.defineProperty(navigator, "clipboard", {
      value: {writeText: vi.fn().mockResolvedValue(undefined)},
      configurable: true,
      writable: true,
    });
  });

  test("should match snapshot", () => {
    const {container} = renderBoardSettings();
    expect(container.firstChild).toMatchSnapshot();
  });

  describe("Access Policy Selector", () => {
    test("renders all three access policy options", () => {
      renderBoardSettings();
      expect(screen.getByText("Open")).toBeInTheDocument();
      expect(screen.getByText("With Approval")).toBeInTheDocument();
      expect(screen.getByText("Password Protected")).toBeInTheDocument();
    });

    test("marks the current board access policy as selected", () => {
      // Default test store has accessPolicy: "PUBLIC"
      renderBoardSettings();
      const openButton = screen.getByText("Open").closest("button")!;
      expect(openButton).toHaveClass("board-settings__access-option--selected");
      expect(openButton).toHaveAttribute("aria-checked", "true");
    });

    test("marks BY_INVITE as selected when board has BY_INVITE policy", () => {
      renderBoardSettings({
        board: {
          status: "ready",
          data: {id: "id", name: "name", accessPolicy: "BY_INVITE", showAuthors: true, showNotesOfOtherUsers: true, showNoteReactions: true, allowStacking: true, isLocked: false},
        },
      });
      const byInviteButton = screen.getByText("With Approval").closest("button")!;
      expect(byInviteButton).toHaveClass("board-settings__access-option--selected");
    });

    test("clicking 'With Approval' dispatches editBoard and shows toast", () => {
      renderBoardSettings();
      fireEvent.click(screen.getByText("With Approval").closest("button")!);
      expect(boardThunks.editBoard).toHaveBeenCalledWith({accessPolicy: "BY_INVITE"});
      expect(Toast.success).toHaveBeenCalledTimes(1);
    });

    test("clicking 'Open' dispatches editBoard and shows toast", () => {
      renderBoardSettings({
        board: {
          status: "ready",
          data: {id: "id", name: "name", accessPolicy: "BY_INVITE", showAuthors: true, showNotesOfOtherUsers: true, showNoteReactions: true, allowStacking: true, isLocked: false},
        },
      });
      fireEvent.click(screen.getByText("Open").closest("button")!);
      expect(boardThunks.editBoard).toHaveBeenCalledWith({accessPolicy: "PUBLIC"});
      expect(Toast.success).toHaveBeenCalledTimes(1);
    });

    test("clicking 'Password Protected' shows password input and does not dispatch yet", () => {
      renderBoardSettings();
      fireEvent.click(screen.getByText("Password Protected").closest("button")!);
      expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
      expect(boardThunks.editBoard).not.toHaveBeenCalled();
    });

    test("password input is not shown when policy is not BY_PASSPHRASE", () => {
      renderBoardSettings();
      expect(screen.queryByPlaceholderText("Password")).not.toBeInTheDocument();
    });

    test("password input is shown when board policy is already BY_PASSPHRASE", () => {
      renderBoardSettings({
        board: {
          status: "ready",
          data: {
            id: "id",
            name: "name",
            accessPolicy: "BY_PASSPHRASE",
            showAuthors: true,
            showNotesOfOtherUsers: true,
            showNoteReactions: true,
            allowStacking: true,
            isLocked: false,
          },
        },
      });
      expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    });
  });

  describe("Password submission", () => {
    const renderWithPassphrase = () =>
      renderBoardSettings({
        board: {
          status: "ready",
          data: {
            id: "id",
            name: "name",
            accessPolicy: "BY_PASSPHRASE",
            showAuthors: true,
            showNotesOfOtherUsers: true,
            showNoteReactions: true,
            allowStacking: true,
            isLocked: false,
          },
        },
      });

    test("pressing Enter submits the password and dispatches editBoard", async () => {
      renderWithPassphrase();
      const input = screen.getByPlaceholderText("Password");
      fireEvent.change(input, {target: {value: "secret123"}});
      fireEvent.keyDown(input, {key: "Enter"});
      expect(boardThunks.editBoard).toHaveBeenCalledWith({accessPolicy: "BY_PASSPHRASE", passphrase: "secret123"});
    });

    test("blurring the input submits the password", async () => {
      renderWithPassphrase();
      const input = screen.getByPlaceholderText("Password");
      fireEvent.change(input, {target: {value: "secret123"}});
      fireEvent.blur(input);
      expect(boardThunks.editBoard).toHaveBeenCalledWith({accessPolicy: "BY_PASSPHRASE", passphrase: "secret123"});
    });

    test("Enter then blur does not dispatch twice", () => {
      renderWithPassphrase();
      const input = screen.getByPlaceholderText("Password");
      fireEvent.change(input, {target: {value: "secret123"}});
      fireEvent.keyDown(input, {key: "Enter"});
      fireEvent.blur(input);
      expect(boardThunks.editBoard).toHaveBeenCalledTimes(1);
    });

    test("does not dispatch if password is empty", () => {
      renderWithPassphrase();
      const input = screen.getByPlaceholderText("Password");
      fireEvent.keyDown(input, {key: "Enter"});
      expect(boardThunks.editBoard).not.toHaveBeenCalled();
    });

    test("shows toast after password is submitted", async () => {
      renderWithPassphrase();
      const input = screen.getByPlaceholderText("Password");
      fireEvent.change(input, {target: {value: "secret123"}});
      fireEvent.keyDown(input, {key: "Enter"});
      await waitFor(() => {
        expect(Toast.success).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Non-moderator", () => {
    const renderAsParticipant = () =>
      renderBoardSettings({
        participants: {
          self: {user: {id: "id", name: "name", isAnonymous: false}, connected: true, ready: false, raisedHand: false, showHiddenColumns: false, role: "PARTICIPANT"},
          others: [],
        },
      });

    test("all access policy buttons are disabled for non-moderators", () => {
      renderAsParticipant();
      const buttons = screen.getAllByRole("radio").filter((el) => ["Open", "With Approval", "Password Protected"].some((label) => el.textContent?.includes(label)));
      buttons.forEach((btn) => expect(btn).toBeDisabled());
    });

    test("clicking a disabled option does not dispatch", () => {
      renderAsParticipant();
      fireEvent.click(screen.getByText("With Approval").closest("button")!);
      expect(boardThunks.editBoard).not.toHaveBeenCalled();
    });
  });
});
