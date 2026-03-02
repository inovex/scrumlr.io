import {fireEvent, render} from "@testing-library/react";
import {createMemoryHistory} from "history";
import {Suspense} from "react";
import {I18nextProvider} from "react-i18next";
import {Provider} from "react-redux";
import {Router} from "react-router";
import * as reactRouter from "react-router";
import i18nTest from "i18nTest";
import {StackView} from "../StackView";
import {ApplicationState} from "store";
import getTestStore from "utils/test/getTestStore";

vi.mock("utils/hook/useImageChecker.ts", async () => ({
  useImageChecker: () => false,
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});

const BOARD_ID = "test-board-id";
const NOTE_ID = "test-notes-id-1";

const createStackView = (overwrite?: Partial<ApplicationState>) => {
  const history = createMemoryHistory();
  return (
    <Suspense fallback={<div>fallback</div>}>
      <I18nextProvider i18n={i18nTest}>
        <Provider store={getTestStore(overwrite)}>
          <Router location={history.location} navigator={history}>
            <StackView />
          </Router>
        </Provider>
      </I18nextProvider>
    </Suspense>
  );
};

describe("StackView", () => {
  beforeEach(() => {
    const portal = global.document.createElement("div");
    portal.setAttribute("id", "portal");
    global.document.querySelector("body")!.appendChild(portal);
    vi.spyOn(reactRouter, "useParams").mockReturnValue({boardId: BOARD_ID, noteId: NOTE_ID});
  });

  describe("display", () => {
    it("should display the column name", () => {
      const {container} = render(createStackView(), {container: global.document.querySelector("#portal")!});
      expect(container.firstChild).toHaveTextContent("test-columns-name-1");
    });

    it("should display the note itself", () => {
      const {container} = render(createStackView(), {container: global.document.querySelector("#portal")!});
      expect(container.firstChild).toHaveTextContent("Lorem Ipsum");
    });
  });

  describe("side effects", () => {
    it("should navigate to board route on close", () => {
      const mockedUsedNavigate = vi.fn();
      vi.spyOn(reactRouter, "useNavigate").mockImplementationOnce(() => mockedUsedNavigate);

      const {container} = render(createStackView(), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".stack-view__portal")).not.toBeNull();
      fireEvent.click(container.querySelector(".stack-view__portal")!);
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/board/${BOARD_ID}`);
    });
  });
});
