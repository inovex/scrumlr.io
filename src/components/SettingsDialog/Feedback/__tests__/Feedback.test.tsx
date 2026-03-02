import {Provider} from "react-redux";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {Feedback} from "../Feedback";
import getTestApplicationState from "utils/test/getTestApplicationState";

const createFeedback = () => (
  <Provider
    store={getTestStore({
      view: {
        ...getTestApplicationState().view,
        feedbackEnabled: true,
      },
    })}
  >
    <Feedback />
  </Provider>
);

describe("Feedback", () => {
  test("should match snapshot", () => {
    const {container} = render(createFeedback());
    expect(container.firstChild).toMatchSnapshot();
  });
});
