import {render} from "@testing-library/react";
import {Provider} from "react-redux";
import {InfoBar} from "../Infobar";
import {ApplicationState} from "types";
import getTestStore from "utils/test/getTestStore";
import {I18nextProvider} from "react-i18next";
import i18nTest from "i18nTest";
import {Router} from "react-router";
import {createBrowserHistory} from "history";

const renderInfoBar = (overwrite?: Partial<ApplicationState>) => {
  return render(
    <Router navigator={createBrowserHistory()} location={location}>
      <I18nextProvider i18n={i18nTest}>
        <Provider store={getTestStore(overwrite)}>
          <InfoBar />
        </Provider>
      </I18nextProvider>
    </Router>,
    {container: document.getElementById("root")!}
  );
};

describe("InfoBar", () => {
  beforeEach(() => {
    const root = global.document.createElement("div");
    root.setAttribute("id", "root");
    global.document.body.appendChild(root);
  });

  test("should have timer component during active timer", () => {
    const {container} = renderInfoBar({
      board: {
        status: "ready",
        data: {
          id: "test-board-id",
          name: "test-board-name",
          accessPolicy: "PUBLIC",
          showAuthors: true,
          showNotesOfOtherUsers: true,
          allowStacking: true,
          timerStart: new Date(123436789),
          timerEnd: new Date(123456789),
        },
      },
    });
    expect(container.getElementsByClassName("timer").length).toBe(1);
  });

  test("should have vote display component during active voting", () => {
    const {container} = renderInfoBar();
    expect(container.getElementsByClassName("vote-display").length).toBe(1);
  });

  test("should have return to focused not button during active sharing", () => {
    const {container} = renderInfoBar({
      board: {
        status: "ready",
        data: {
          id: "test-board-id",
          name: "test-board-name",
          accessPolicy: "PUBLIC",
          showAuthors: true,
          showNotesOfOtherUsers: true,
          allowStacking: true,
          sharedNote: "test",
        },
      },
    });
    expect(container.getElementsByClassName("info-bar__return-to-shared-note-button").length).toBe(1);
  });
});
