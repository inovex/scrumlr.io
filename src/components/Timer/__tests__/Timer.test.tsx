import {render} from "testUtils";
import {Timer} from "components/Timer";
import i18n from "i18n";

jest.useFakeTimers().setSystemTime(new Date(60000));

describe("Timer", () => {
  test("should render correctly", () => {
    const {container} = render(<Timer startTime={new Date(0)} endTime={new Date(180000)} />, {container: document.getElementById("root")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  test("should have cancel button if user is moderator", () => {
    const {container} = render(<Timer startTime={new Date(0)} endTime={new Date(180000)} />, {container: document.getElementById("root")!});
    expect(container.firstChild).toContainElement(container.getElementsByTagName("button")[0]);
  });

  test("should have expired class if timer is over", () => {
    const {container} = render(<Timer startTime={new Date(0)} endTime={new Date(60000)} />, {container: document.getElementById("root")!});
    expect(container.getElementsByClassName("timer--expired").length).toBe(1);
  });

  test("should have increment button if user is moderator", () => {
    const {findByLabelText} = render(<Timer startTime={new Date(0)} endTime={new Date(60000)} />, {container: document.getElementById("root")!});
    expect(findByLabelText(i18n.t("Timer.addOneMinute"))).toBeDefined();
  });
});
