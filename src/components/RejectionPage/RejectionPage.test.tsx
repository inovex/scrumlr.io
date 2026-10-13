import {fireEvent, screen, waitFor} from "@testing-library/react";
import {API} from "api";
import {Mock} from "vitest";
import {render} from "testUtils";
import {RejectionPage} from "./RejectionPage";

const mockDispatch = vi.fn();

vi.mock("store", async () => {
  const actual = await vi.importActual<typeof import("store")>("store");
  return {
    ...actual,
    useAppDispatch: () => mockDispatch,
  };
});

vi.mock("api", () => ({
  API: {
    joinBoard: vi.fn(),
  },
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useParams: () => ({boardId: "board-1"}),
  };
});

describe("RejectionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should match snapshot", () => {
    const {container} = render(<RejectionPage status="rejected" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should show retry button only for banned users", () => {
    const {rerender} = render(<RejectionPage status="rejected" />);
    expect(screen.queryByTestId("rejection-board__retry")).not.toBeInTheDocument();

    rerender(<RejectionPage status="banned" />);
    expect(screen.getByTestId("rejection-board__retry")).toBeInTheDocument();
    expect(screen.getByTestId("rejection-board__to-homepage")).toBeInTheDocument();
  });

  it("should keep homepage button enabled while retrying", () => {
    (API.joinBoard as Mock).mockReturnValue(new Promise(() => {}));

    render(<RejectionPage status="banned" />);

    const retryButton = screen.getByTestId("rejection-board__retry");
    const homeButton = screen.getByTestId("rejection-board__to-homepage");

    fireEvent.click(retryButton);

    expect(retryButton).toBeDisabled();
    expect(homeButton).not.toBeDisabled();
  });

  it("should dispatch permitted board access when retry succeeds with accepted status", async () => {
    (API.joinBoard as Mock).mockResolvedValue({status: "ACCEPTED"});

    render(<RejectionPage status="banned" />);
    fireEvent.click(screen.getByTestId("rejection-board__retry"));

    await waitFor(() => {
      expect(API.joinBoard).toHaveBeenCalledWith("board-1");
      expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
