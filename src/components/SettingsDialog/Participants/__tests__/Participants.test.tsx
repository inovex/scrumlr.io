import {Provider} from "react-redux";
import {MockStoreEnhanced} from "redux-mock-store";
import {render} from "testUtils";
import {ApplicationState} from "types";
import getTestStore from "utils/test/getTestStore";
import {Participants} from "../Participants";

const createParticipants = (store: MockStoreEnhanced<ApplicationState>) => (
  <Provider store={store}>
    <Participants />
  </Provider>
);

describe("Participants", () => {
  test("should render filter and participants correctly", () => {
    const {container} = render(createParticipants(getTestStore()));
    expect(container.firstChild).toMatchSnapshot();
  });

  describe("Ban Feature", () => {
    test("ban button not available on self", () => {
      const {container} = render(createParticipants(getTestStore()));
      const participants = container.getElementsByClassName("participants__list")[0].childNodes;
      expect(participants[0].lastChild).not.toHaveClass("participant__kick-icon");
    });

    test("ban button available on moderator", () => {
      const {container} = render(createParticipants(getTestStore()));
      const participants = container.getElementsByClassName("participants__list")[0].childNodes;
      expect(participants[1].lastChild).toHaveClass("participant__kick-icon");
    });
  });
});
