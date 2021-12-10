import {render} from "@testing-library/react";
import configureStore from "redux-mock-store";
import {Provider} from "react-redux";
import {Infobar} from "../Infobar";

const mockStore = configureStore();
const createInfoBar = (activeVoting: boolean, activeTimer: boolean) => {
  const initialState = {
    board: {
      data: {
        timerUTCEndTime: activeTimer ? new Date(12345) : undefined,
        voting: activeVoting ? "active" : "disabled",
      },
    },
    voteConfiguration: {
      voteLimit: 5,
    },
    votes: [],
    users: {
      admins: [],
      basic: [],
      all: [],
    },
  };
  return (
    <Provider store={mockStore(initialState)}>
      <Infobar />
    </Provider>
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
      const {container} = render(createInfoBar(false, false), {container: document.getElementById("root")!});
      expect(container).toMatchSnapshot();
    });

    test("with disabled voting and active timer", () => {
      const {container} = render(createInfoBar(false, true), {container: document.getElementById("root")!});
      expect(container).toMatchSnapshot();
    });

    test("with active voting and disabled timer", () => {
      const {container} = render(createInfoBar(true, false), {container: document.getElementById("root")!});
      expect(container).toMatchSnapshot();
    });

    test("with active voting and timer", () => {
      const {container} = render(createInfoBar(true, true), {container: document.getElementById("root")!});
      expect(container).toMatchSnapshot();
    });
  });
});
