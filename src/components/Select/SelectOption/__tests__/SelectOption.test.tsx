import {render} from "testUtils";
import {SelectOption} from "components/Select/SelectOption/SelectOption";
import GlobeIcon from "assets/icons/open.svg?react";
import LockIcon from "assets/icons/lock-closed.svg?react";
import {SelectContext} from "utils/hooks/useSelect";
import {fireEvent} from "@testing-library/react";

const renderSelectOption = (override?: {activeIndex?: number; setActiveIndex?: (index: number) => void}) => {
  const providerContext = {activeIndex: 0, setActiveIndex: vi.fn(), ...override};
  return render(
    <SelectContext.Provider value={providerContext}>
      <SelectOption label={"test"} description={"another test"} icon={<GlobeIcon />} index={0} />
    </SelectContext.Provider>
  );
};

const renderMultipleSelectOptions = (override?: {activeIndex?: number; setActiveIndex?: (index: number) => void}) => {
  const providerContext = {activeIndex: 0, setActiveIndex: vi.fn(), ...override};
  return render(
    <SelectContext.Provider value={providerContext}>
      <SelectOption label={"test 1"} description={"another test 1"} icon={<GlobeIcon />} index={0} />
      <SelectOption label={"test 2"} description={"another test 2"} icon={<LockIcon />} index={1} />
    </SelectContext.Provider>
  );
};

describe("SelectOption (single)", () => {
  it("should render correctly", () => {
    const {container} = renderSelectOption();
    expect(container).toMatchSnapshot();
  });

  it("be active by default", () => {
    const {container} = renderSelectOption();
    const selectOption = container.querySelector<HTMLButtonElement>(".select-option");
    expect(selectOption).toHaveClass("select-option--active");
    const selectOptionRadio = container.querySelector<HTMLInputElement>(".select-option__radio");
    expect(selectOptionRadio).toBeChecked();
  });

  it("should call back active index", () => {
    const setActiveIndexSpy: (index: number) => void = vi.fn();
    const {container} = renderSelectOption({setActiveIndex: setActiveIndexSpy});

    const selectOption = container.querySelector<HTMLButtonElement>(".select-option")!;
    fireEvent.click(selectOption);
    expect(setActiveIndexSpy).toHaveBeenCalled();
  });
});

describe("SelectOption (multiple)", () => {
  it("should render correctly", () => {
    const {container} = renderMultipleSelectOptions();
    expect(container).toMatchSnapshot();
  });

  it("be active by default", () => {
    const {container} = renderMultipleSelectOptions();
    const selectOption = container.querySelectorAll<HTMLButtonElement>(".select-option");
    expect(selectOption[0]).toHaveClass("select-option--active");
    expect(selectOption[1]).not.toHaveClass("select-option--active");
    const selectOptionRadio = container.querySelectorAll<HTMLInputElement>(".select-option__radio");
    expect(selectOptionRadio[0]).toBeChecked();
    expect(selectOptionRadio[1]).not.toBeChecked();
  });

  it("should call back active index", () => {
    const setActiveIndexSpy: (index: number) => void = vi.fn();
    const {container} = renderSelectOption({setActiveIndex: setActiveIndexSpy});

    const selectOption = container.querySelector<HTMLButtonElement>(".select-option")!;
    fireEvent.click(selectOption);
    expect(setActiveIndexSpy).toHaveBeenCalled();
  });
});
