import {render} from "@testing-library/react";
import {Provider} from "react-redux";
import {InfoBar} from "../Infobar";
import {ApplicationState} from "types";
import getTestStore from "utils/test/getTestStore";
import {I18nextProvider} from "react-i18next";
import i18nTest from "i18nTest";

const renderInfoBar = (overwrite?: Partial<ApplicationState>) => {
  return render(
    <I18nextProvider i18n={i18nTest}>
      <Provider store={getTestStore(overwrite)}>
        <InfoBar />
      </Provider>
    </I18nextProvider>,
    {container: document.getElementById("root")!}
  );
};

describe("InfoBar", () => {
  beforeEach(() => {
    const root = global.document.createElement("div");
    root.setAttribute("id", "root");
    global.document.body.appendChild(root);
  });

  describe("should render correctly", () => {
    test("with disabled voting and timer", () => {
      const {container} = renderInfoBar({votings: {open: undefined, past: []}});
      expect(container).toMatchSnapshot();
    });

    test("with disabled voting and active timer", () => {
      const {container} = renderInfoBar({
        votings: {open: undefined, past: []},
        board: {
          status: "ready",
          data: {
            id: "test-board-id",
            name: "test-board-name",
            accessPolicy: "PUBLIC",
            showAuthors: true,
            showNotesOfOtherUsers: true,
            allowStacking: true,
            timerEnd: new Date(123456789),
          },
        },
      });
      expect(container).toMatchSnapshot();
    });

    test("with active voting and disabled timer", () => {
      const {container} = renderInfoBar();
      expect(container).toMatchSnapshot();
    });

    test("with active voting and timer", () => {
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
            timerEnd: new Date(123456789),
          },
        },
      });
      expect(container).toMatchSnapshot();
    });
  });
});
