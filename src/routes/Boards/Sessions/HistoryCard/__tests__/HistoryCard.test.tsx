import {render} from "testUtils";
import {render as rtlRender, fireEvent, screen, waitFor} from "@testing-library/react";
import {I18nextProvider} from "react-i18next";
import {MemoryRouter} from "react-router";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import i18n from "i18nTest";
import {API} from "api";
import {HistoryBoard, ParticipantRole, ParticipantWithUser} from "store/features";
import {HistoryCard} from "../HistoryCard";

afterEach(() => {
  vi.restoreAllMocks();
});

const makeBoard = (userRole: ParticipantRole): HistoryBoard => ({
  id: "1",
  name: "Test Board",
  description: "desc",
  accessPolicy: "PUBLIC",
  columns: [
    {id: "c1", name: "A", description: "", color: "backlog-blue", visible: true, index: 0},
    {id: "c2", name: "B", description: "", color: "poker-purple", visible: true, index: 1},
  ],
  participants: 1,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  modifiedAt: new Date("2026-01-01T00:00:00.000Z"),
  notes: 0,
  isLocked: false,
  userRole,
  favourite: false,
});

const openMenu = (container: HTMLElement) => {
  fireEvent.click(container.querySelector(".history-card__icon--menu")!);
};

describe("HistoryCard menu role gating", () => {
  it("shows edit and delete for an owner", () => {
    const {container} = render(<HistoryCard board={makeBoard("OWNER")} />);
    openMenu(container);

    expect(screen.getByRole("button", {name: "Edit"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "Delete"})).toBeInTheDocument();
  });

  it("shows edit but not delete for a moderator", () => {
    const {container} = render(<HistoryCard board={makeBoard("MODERATOR")} />);
    openMenu(container);

    expect(screen.getByRole("button", {name: "Edit"})).toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "Delete"})).not.toBeInTheDocument();
  });

  it("shows neither edit nor delete for a participant", () => {
    const {container} = render(<HistoryCard board={makeBoard("PARTICIPANT")} />);
    openMenu(container);

    expect(screen.queryByRole("button", {name: "Edit"})).not.toBeInTheDocument();
    expect(screen.queryByRole("button", {name: "Delete"})).not.toBeInTheDocument();
  });
});

describe("HistoryCard favourite", () => {
  it("persists the favourite via the participant API and updates the store", async () => {
    const participant = {user: {id: "u", name: "n", isAnonymous: true}, connected: true, ready: false, raisedHand: false, showHiddenColumns: false, role: "OWNER"} as ParticipantWithUser;
    const editParticipant = vi.spyOn(API, "editParticipant").mockResolvedValue(participant);

    const board = makeBoard("OWNER"); // favourite: false
    const store = getTestStore({history: [board]});
    const {container} = rtlRender(
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          <MemoryRouter>
            <HistoryCard board={board} />
          </MemoryRouter>
        </Provider>
      </I18nextProvider>
    );

    fireEvent.click(container.querySelector(".history-card__favourite")!);

    expect(editParticipant).toHaveBeenCalledWith("1", "test-auth-user-id", {favourite: true});
    await waitFor(() => expect(store.getState().history[0].favourite).toBe(true));
  });
});

describe("HistoryCard delete", () => {
  it("confirms first, then deletes via the API and removes it from the store", async () => {
    const deleteBoard = vi.spyOn(API, "deleteBoard").mockResolvedValue(undefined);

    // the ConfirmationDialog renders through a Portal, which needs a #portal element.
    const portal = document.createElement("div");
    portal.setAttribute("id", "portal");
    document.body.appendChild(portal);

    const board = makeBoard("OWNER");
    const store = getTestStore({history: [board]});
    const {container} = rtlRender(
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          <MemoryRouter>
            <HistoryCard board={board} />
          </MemoryRouter>
        </Provider>
      </I18nextProvider>
    );

    openMenu(container);
    fireEvent.click(screen.getByRole("button", {name: "Delete"}));

    // nothing happens until the user confirms deletion
    expect(screen.getByText("Delete board?")).toBeInTheDocument();
    expect(deleteBoard).not.toHaveBeenCalled();

    fireEvent.click(document.querySelector(".confirmation-dialog__button--accept")!);

    expect(deleteBoard).toHaveBeenCalledWith("1");
    await waitFor(() => expect(store.getState().history).toHaveLength(0));
  });
});
