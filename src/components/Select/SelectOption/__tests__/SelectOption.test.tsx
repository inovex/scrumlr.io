import {render} from "testUtils";
import {SelectOption} from "components/Select/SelectOption/SelectOption";
import {ReactComponent as GlobeIcon} from "assets/icons/open.svg";
import {SelectContext} from "utils/hooks/useSelect";
import {fireEvent} from "@testing-library/react";

const renderSelectOption = (override?: {activeIndex?: number; setActiveIndex?: (index: number) => void}) => {
  const providerContext = {activeIndex: 0, setActiveIndex: jest.fn, ...override};
  return render(
    <SelectContext.Provider value={providerContext}>
      <SelectOption label={"test"} description={"another test"} icon={<GlobeIcon />} index={0} />
    </SelectContext.Provider>
  );
};

describe("SelectOption", () => {
  it("should render correctly", () => {
    const {container} = renderSelectOption();
    expect(container).toMatchSnapshot();
  });

  it("be active by default", () => {
    const {container} = renderSelectOption();
    const selectOption = container.querySelector<HTMLDivElement>(".select-option");
    expect(selectOption).toHaveClass("select-option--active");
    const selectOptionRadio = container.querySelector<HTMLInputElement>(".select-option__radio");
    expect(selectOptionRadio).toBeChecked();
  });

  it("should call back active index", () => {
    const setActiveIndexSpy: (index: number) => void = jest.fn();
    const {container} = renderSelectOption({setActiveIndex: setActiveIndexSpy});

    const selectOption = container.querySelector<HTMLDivElement>(".select-option")!;
    fireEvent.click(selectOption);
    expect(setActiveIndexSpy).toHaveBeenCalled();
  });
});
