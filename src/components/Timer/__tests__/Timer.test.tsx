import {render} from "testUtils";
import * as store from "store";
import {Timer} from "components/Timer";
import {mocked} from "ts-jest/utils";
import {useAppSelector} from "store";

jest.mock("store");
const mockedUseAppSelector = mocked(useAppSelector);

describe("Timer", () => {
  beforeEach(() => {
    const root = global.document.createElement("div");
    root.setAttribute("id", "root");
    global.document.querySelector("body")!.appendChild(root);
  });

  test("should render correctly", () => {
    mockedUseAppSelector.mockResolvedValue({} as never);
    const {container} = render(<Timer endTime={new Date(new Date().getTime() + 3 * 60000)} />, {container: document.getElementById("root")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  test("should have cancel button if user is moderator", () => {
    mockedUseAppSelector.mockResolvedValue({} as never);
    const {container} = render(<Timer endTime={new Date(new Date().getTime() + 3 * 60000)} />, {container: document.getElementById("root")!});
    expect(container.firstChild).toContainElement(container.getElementsByTagName("button")[0]);
  });

  test("should have expired class if timer is over", () => {
    mockedUseAppSelector.mockResolvedValue({} as never);
    const {container} = render(<Timer endTime={new Date(new Date().getTime())} />, {container: document.getElementById("root")!});
    expect(container.firstChild).toHaveClass("timer--expired");
  });
});
