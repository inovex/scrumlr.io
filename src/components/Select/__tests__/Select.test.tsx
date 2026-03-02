import {render} from "testUtils";
import {Select} from "components/Select/Select";
import {SelectOption} from "components/Select/SelectOption/SelectOption";
import KeyIcon from "assets/icons/key-protected.svg?react";
import GlobeIcon from "assets/icons/open.svg?react";
import LockIcon from "assets/icons/lock-closed.svg?react";

const renderSelect = () =>
  render(
    <Select activeIndex={0} setActiveIndex={vi.fn()}>
      <SelectOption label={"test 1"} description={"another test 1"} icon={<GlobeIcon />} />
      <SelectOption label={"test 2"} description={"another test 2"} icon={<LockIcon />} />
      <SelectOption label={"test 3"} description={"another test 3"} icon={<KeyIcon />} />
    </Select>
  );

describe("Select", () => {
  it("should render correctly", () => {
    const {container} = renderSelect();

    expect(container).toMatchSnapshot();
  });
});
