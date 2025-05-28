import {render} from "testUtils";
import {Select} from "components/Select/Select";
import {SelectOption} from "components/Select/SelectOption/SelectOption";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {ReactComponent as GlobeIcon} from "assets/icons/open.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";

const renderSelect = () =>
  render(
    <Select activeIndex={0} setActiveIndex={jest.fn}>
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
