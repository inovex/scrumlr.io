import "../matchMedia.mock";
import {Provider} from "react-redux";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {Appearance} from "../Appearance";

const createAppearance = () => (
  <Provider store={getTestStore()}>
    <Appearance />
  </Provider>
);

describe("Appearance", () => {
  test("should render all Settings correctly", () => {
    const {container} = render(createAppearance());
    expect(container.firstChild).toMatchSnapshot();
  });
});
