import {render} from "@testing-library/react";
import {mocked} from "ts-jest/utils";
import {useAppSelector} from "store";
import {Infobar} from "../Infobar";

jest.mock("store");
const mockedUseAppSelector = mocked(useAppSelector);

describe("<InfoBar />", () => {
  beforeEach(() => {
    const root = global.document.createElement("div");
    root.setAttribute("id", "root");
    global.document.querySelector("body")!.appendChild(root);
  });

  test("empty snapshot test", () => {
    const {container} = render(<Infobar activeVoting={false} usedVotes={5} possibleVotes={10} />, {container: document.getElementById("root")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  test("voting snapshot test", () => {
    const {container} = render(<Infobar activeVoting usedVotes={5} possibleVotes={10} />, {container: document.getElementById("root")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  test("timer snapshot test", () => {
    mockedUseAppSelector.mockResolvedValue({} as never);
    const {container} = render(<Infobar endTime={new Date(12345)} activeVoting={false} usedVotes={5} possibleVotes={10} />, {container: document.getElementById("root")!});
    expect(container.firstChild).toMatchSnapshot();
  });

  test("timer and voting snapshot test", () => {
    mockedUseAppSelector.mockResolvedValue({} as never);
    const {container} = render(<Infobar endTime={new Date(12345)} activeVoting usedVotes={5} possibleVotes={10} />, {container: document.getElementById("root")!});
    expect(container.firstChild).toMatchSnapshot();
  });
});
