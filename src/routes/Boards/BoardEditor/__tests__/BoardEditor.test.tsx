import {render, fireEvent, screen} from "@testing-library/react";
import {I18nextProvider} from "react-i18next";
import {MemoryRouter, Route, Routes} from "react-router";
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {HistoryBoard, ParticipantRole} from "store/features";
import i18n from "i18nTest";
import {BoardEditor} from "../BoardEditor";

const makeBoard = (userRole: ParticipantRole): HistoryBoard => ({
  id: "1",
  name: "My Board",
  description: "My description",
  accessPolicy: "PUBLIC",
  columns: [
    {id: "c1", name: "Column A", description: "", color: "backlog-blue", visible: true, index: 0},
    {id: "c2", name: "Column B", description: "", color: "poker-purple", visible: true, index: 1},
  ],
  participants: 1,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  modifiedAt: new Date("2026-01-01T00:00:00.000Z"),
  notes: 0,
  isLocked: false,
  userRole,
  favourite: false,
});

const renderBoardEditor = (board: HistoryBoard) => {
  const store = getTestStore({history: [board]});
  const view = render(
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/boards/edit-board/${board.id}`]}>
          <Routes>
            <Route path="/boards/edit-board/:boardId" element={<BoardEditor />} />
            <Route path="/boards/history" element={<div>history page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    </I18nextProvider>
  );
  return {store, ...view};
};

describe("BoardEditor", () => {
  it("pre-fills the form with the board's data for an owner", () => {
    const {container} = renderBoardEditor(makeBoard("OWNER"));

    const nameInput = container.querySelector<HTMLInputElement>(".template-editor__name-input input")!;
    const descriptionInput = container.querySelector<HTMLTextAreaElement>(".template-editor__description-text-area")!;

    expect(nameInput).toHaveValue("My Board");
    expect(descriptionInput).toHaveValue("My description");
  });

  it("saves the edited name and redirects back to history", () => {
    const {store, container} = renderBoardEditor(makeBoard("OWNER"));

    const nameInput = container.querySelector<HTMLInputElement>(".template-editor__name-input input")!;
    fireEvent.input(nameInput, {target: {value: "Renamed Board"}});
    fireEvent.click(container.querySelector<HTMLButtonElement>(".template-editor__button--create")!);

    expect(screen.getByText("history page")).toBeInTheDocument();
    expect(store.getState().history[0].name).toBe("Renamed Board");
  });

  it("loads the history itself when deep-linked into an empty store", async () => {
    const store = getTestStore(); // history defaults to []
    render(
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          <MemoryRouter initialEntries={["/boards/edit-board/1"]}>
            <Routes>
              <Route path="/boards/edit-board/:boardId" element={<BoardEditor />} />
              <Route path="/boards/history" element={<div>history page</div>} />
            </Routes>
          </MemoryRouter>
        </Provider>
      </I18nextProvider>
    );

    // getBoards (mock) populates the slice, then the owner board "1" pre-fills the editor.
    expect(await screen.findByDisplayValue("Test Board 1")).toBeInTheDocument();
  });

  it("redirects a participant away from the editor", () => {
    const {container} = renderBoardEditor(makeBoard("PARTICIPANT"));

    expect(screen.getByText("history page")).toBeInTheDocument();
    expect(container.querySelector(".template-editor__name-input input")).toBeNull();
  });
});
