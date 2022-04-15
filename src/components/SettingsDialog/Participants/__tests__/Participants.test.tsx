import {Provider} from "react-redux";
import {MockStoreEnhanced} from "redux-mock-store";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {ApplicationState} from "types";
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
});
