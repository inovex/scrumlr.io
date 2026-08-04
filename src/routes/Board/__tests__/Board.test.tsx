import {render} from "@testing-library/react";
import type {ReactNode} from "react";
import {Board} from "../Board";

const mockDispatch = vi.fn();

let mockApplicationState = {
  board: {
    data: {
      id: "board-1",
      isLocked: false,
    },
    status: "ready",
  },
  columns: [],
  requests: [],
  participants: {
    self: {
      role: "OWNER",
      showHiddenColumns: false,
      banned: false,
    },
    others: [],
  },
  auth: {},
  view: {
    moderating: false,
  },
};

vi.mock("components/LoadingScreen", () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}));

vi.mock("components/Board", () => ({
  BoardComponent: ({children}: {children: ReactNode}) => <div data-testid="board-component">{children}</div>,
}));

vi.mock("components/Column", () => ({
  Column: () => <div data-testid="column" />,
}));

vi.mock("components/Requests", () => ({
  Requests: () => <div data-testid="requests" />,
}));

vi.mock("components/BoardReactionContainer/BoardReactionContainer", () => ({
  BoardReactionContainer: () => <div data-testid="board-reaction-container" />,
}));

vi.mock("components/SnowfallWrapper/SnowfallWrapper", () => ({
  SnowfallWrapper: () => <div data-testid="snowfall-wrapper" />,
}));

vi.mock("react-toastify", () => ({
  toast: {
    clearWaitingQueue: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock("store", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) => selector(mockApplicationState),
}));

vi.mock("store/features", () => ({
  leaveBoard: vi.fn(() => ({type: "board/leaveBoard"})),
}));

vi.mock("utils/participant", () => ({
  isParticipantModerator: () => false,
}));

vi.mock("utils/Toast", () => ({
  Toast: {
    info: vi.fn(),
  },
}));

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual<typeof import("react-i18next")>("react-i18next");
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: {count?: number}) => `${key}:${options?.count ?? ""}`,
    }),
  };
});

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet" />,
  };
});

describe("Board route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApplicationState = {
      board: {
        data: {
          id: "board-1",
          isLocked: false,
        },
        status: "ready",
      },
      columns: [],
      requests: [],
      participants: {
        self: {
          role: "OWNER",
          showHiddenColumns: false,
          banned: false,
        },
        others: [],
      },
      auth: {},
      view: {
        moderating: false,
      },
    };
  });

  it("renders board content when board state is ready", () => {
    const {getByTestId} = render(<Board />);

    expect(getByTestId("board-component")).toBeInTheDocument();
    expect(getByTestId("outlet")).toBeInTheDocument();
  });
});
