import {render} from "testUtils";
import {Timer} from "components/Timer";
import {useAppSelector} from "store";
import {t} from "i18next";

jest.mock("store");
const mockedUseAppSelector = jest.mocked(useAppSelector);

jest.useFakeTimers().setSystemTime(new Date(60000));

describe("Timer", () => {
  test("should render correctly", () => {
    mockedUseAppSelector.mockResolvedValue({} as never);
    const {container} = render(<Timer startTime={new Date(0)} endTime={new Date(180000)} />, {container: document.getElementById("root")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  test("should have cancel button if user is moderator", () => {
    mockedUseAppSelector.mockResolvedValue({} as never);
    const {container} = render(<Timer startTime={new Date(0)} endTime={new Date(180000)} />, {container: document.getElementById("root")!});
    expect(container.firstChild).toContainElement(container.getElementsByTagName("button")[0]);
  });

  test("should have expired class if timer is over", () => {
    mockedUseAppSelector.mockResolvedValue({} as never);
    const {container} = render(<Timer startTime={new Date(0)} endTime={new Date(60000)} />, {container: document.getElementById("root")!});
    expect(container.getElementsByClassName("timer--expired").length).toBe(1);
  });

  test("should have increment button if user is moderator", () => {
    mockedUseAppSelector.mockResolvedValue({} as never);
    const {getByText} = render(<Timer startTime={new Date(0)} endTime={new Date(60000)} />, {container: document.getElementById("root")!});
    expect(getByText(t("Timer.addOneMinute"))).toBeDefined();
  });
});
