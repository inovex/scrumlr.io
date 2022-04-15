import {Provider} from "react-redux";
import {render} from "testUtils";
import getTestStore from "utils/test/getTestStore";
import {BoardSettings} from "../BoardSettings";

const createBoardSettings = () => (
  <Provider store={getTestStore()}>
    <BoardSettings />
  </Provider>
);

describe("BoardSettings", () => {
  test("should match snapshot", () => {
    const {container} = render(createBoardSettings());
    expect(container.firstChild).toMatchSnapshot();
  });
});
