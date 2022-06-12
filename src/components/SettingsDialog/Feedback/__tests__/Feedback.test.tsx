import {Provider} from "react-redux";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {Feedback} from "../Feedback";

const createFeedback = () => (
  <Provider store={getTestStore({view: {moderating: false, serverTimeOffset: new Date().getUTCDate(), feedbackEnabled: true, enabledAuthProvider: []}})}>
    <Feedback />
  </Provider>
);

describe("Feedback", () => {
  test("should match snapshot", () => {
    const {container} = render(createFeedback());
    expect(container.firstChild).toMatchSnapshot();
  });
});
