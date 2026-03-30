import {render} from "testUtils";
import {Boards} from "routes/Boards/Boards";

const renderBoards = () => render(<Boards />);

// like Templates, thunks don't work yet in this enviroment,
// wait for https://github.com/inovex/scrumlr.io/issues/5079 before proceeding with testing.
describe.skip("Boards", () => {
  it("should render correctly", () => {
    const {container} = renderBoards();

    expect(container).toMatchSnapshot();
  });
});
