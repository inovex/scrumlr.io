import {render} from "testUtils";
import {render as rtlRender, fireEvent, screen} from "@testing-library/react";
import {I18nextProvider} from "react-i18next";
import {MemoryRouter} from "react-router";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import i18n from "i18nTest";
import {HistoryBoard, ParticipantRole} from "store/features";
import {HistoryCard} from "../HistoryCard";

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
  it("toggles the board's favourite in the store when the star is clicked", () => {
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

    expect(store.getState().history[0].favourite).toBe(true);
  });
});

describe("HistoryCard delete", () => {
  it("removes the board from the store when an owner clicks delete", () => {
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

    expect(store.getState().history).toHaveLength(0);
  });
});
