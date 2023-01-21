import {fireEvent, render} from "@testing-library/react";
import {createMemoryHistory} from "history";
import {Suspense} from "react";
import {I18nextProvider} from "react-i18next";
import {Provider} from "react-redux";
import {Router} from "react-router";
import * as reactRedux from "react-redux";
import * as reactRouter from "react-router";
import i18nTest from "i18nTest";
import {StackView} from "../StackView";
import {Actions} from "store/action";
import {ApplicationState} from "types";
import {ViewState} from "types/view";
import getTestStore from "utils/test/getTestStore";

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
    jest.spyOn(reactRouter, "useParams").mockReturnValue({boardId: BOARD_ID, noteId: NOTE_ID});
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
    it("should unshare note during active moderation on close", () => {
      const dispatchSpy = jest.fn();
      jest.spyOn(reactRedux, "useDispatch").mockImplementationOnce(() => dispatchSpy);
      const view: ViewState = {
        moderating: true,
        serverTimeOffset: 0,
        feedbackEnabled: false,
        enabledAuthProvider: [],
        hotkeysAreActive: false,
        noteFocused: false,
      };
      const {container} = render(
        createStackView({
          view,
          participants: {
            others: [],
            self: {user: {id: "test-user-id", name: "test-user-name"}, role: "MODERATOR", connected: true, ready: false, raisedHand: false, showHiddenColumns: true},
            focusInitiator: null,
          },
        }),
        {container: global.document.querySelector("#portal")!}
      );
      expect(container.querySelector(".stack-view__portal")).not.toBeNull();
      fireEvent.click(container.querySelector(".stack-view__portal")!);
      expect(dispatchSpy).toHaveBeenCalledWith(Actions.stopSharing());
    });

    it("should navigate to board route on close", () => {
      const navigateSpy = jest.fn();
      jest.spyOn(reactRouter, "useNavigate").mockImplementationOnce(() => navigateSpy);
      const {container} = render(createStackView(), {container: global.document.querySelector("#portal")!});
      expect(container.querySelector(".stack-view__portal")).not.toBeNull();
      fireEvent.click(container.querySelector(".stack-view__portal")!);
      expect(navigateSpy).toHaveBeenCalledWith(`/board/${BOARD_ID}`);
    });
  });
});
