import {ColumnConfiguratorColumnNameDetails, ColumnConfiguratorColumnNameDetailsProps} from "../ColumnConfiguratorColumnNameDetails";
import {render} from "testUtils";
import {fireEvent} from "@testing-library/react";

const renderColumnConfiguratorColumnNameDetails = (override?: Partial<ColumnConfiguratorColumnNameDetailsProps>) => {
  const defaultProps: ColumnConfiguratorColumnNameDetailsProps = {
    className: "column-configurator-column-name-details",
    name: "Default Name",
    description: "Default Description",
    openState: "closed",
    setOpenState: jest.fn(),
    updateColumnTitle: jest.fn(),
  };

  return render(<ColumnConfiguratorColumnNameDetails {...defaultProps} {...override} />);
};

describe("ColumnConfiguratorColumnNameDetails render", () => {
  it("should render correctly (closed)", () => {
    const {container} = renderColumnConfiguratorColumnNameDetails({openState: "closed"});
    expect(container).toMatchSnapshot();
  });

  it("should render correctly (visualFeedback)", () => {
    const {container} = renderColumnConfiguratorColumnNameDetails({openState: "visualFeedback"});
    expect(container).toMatchSnapshot();
  });

  it("should render correctly (nameFirst)", () => {
    const {container} = renderColumnConfiguratorColumnNameDetails({openState: "nameFirst"});
    expect(container).toMatchSnapshot();
  });

  it("should render correctly (descriptionFirst)", () => {
    const {container} = renderColumnConfiguratorColumnNameDetails({openState: "descriptionFirst"});
    expect(container).toMatchSnapshot();
  });

  it("should match title and description", () => {
    const name = "Custom Title";
    const description = "Custom Description";
    const {container} = renderColumnConfiguratorColumnNameDetails({name, description});

    expect(container.querySelector<HTMLInputElement>(".column-configurator-column-name-details__name")).toHaveValue(name);
    expect(container.querySelector<HTMLDivElement>(".column-configurator-column-name-details__inline-description")).toHaveTextContent(description);
  });
});

describe("ColumnConfiguratorColumnNameDetails behaviour", () => {
  it("should close after losing focus", () => {
    const setOpenStateSpy = jest.fn();
    const {container} = renderColumnConfiguratorColumnNameDetails({openState: "nameFirst", setOpenState: setOpenStateSpy});

    // note: useOnBlur does not actually use the native blur event, but scans for clicks outside the element instead.
    // this is why to simulate the blur, we just click somewhere on the document.
    // const wrapperElement = container.firstChild as HTMLDivElement
    // fireEvent.blur(wrapperElement);
    fireEvent.click(document);

    expect(setOpenStateSpy).toHaveBeenCalledWith("closed");
  });

  it("should close without saving when there are no actual changes", () => {
    const setOpenStateSpy = jest.fn();
    const {container} = renderColumnConfiguratorColumnNameDetails({openState: "nameFirst", setOpenState: setOpenStateSpy});

    const saveChangesButtonElement = container.querySelector<HTMLButtonElement>(".mini-menu-item--save")!;
    fireEvent.mouseDown(saveChangesButtonElement);

    expect(setOpenStateSpy).toHaveBeenCalledWith("closed");
  });

  it("should set openState to visualFeedback, then to closed upon confirming changes", () => {
    jest.useFakeTimers();
    const setOpenStateSpy = jest.fn();
    const {container} = renderColumnConfiguratorColumnNameDetails({openState: "nameFirst", setOpenState: setOpenStateSpy});

    // make sure to insert actual changes
    const inputElement = container.querySelector<HTMLInputElement>(".column-configurator-column-name-details__name")!;
    fireEvent.input(inputElement, {target: {value: "Custom Title"}});

    const saveChangesButtonElement = container.querySelector<HTMLButtonElement>(".mini-menu-item--save")!;
    fireEvent.mouseDown(saveChangesButtonElement);

    expect(setOpenStateSpy).toHaveBeenCalledWith("visualFeedback");

    setTimeout(() => {
      expect(setOpenStateSpy).toHaveBeenCalledWith("closed");
    }, 2000);

    jest.runAllTimers();
  });

  it("should call save changes with new input title", () => {
    const updateColumnTitleSpy = jest.fn();
    const {container} = renderColumnConfiguratorColumnNameDetails({openState: "nameFirst", updateColumnTitle: updateColumnTitleSpy});

    const inputElement = container.querySelector<HTMLInputElement>(".column-configurator-column-name-details__name")!;
    fireEvent.input(inputElement, {target: {value: "Custom Title"}});

    const saveChangesButtonElement = container.querySelector<HTMLButtonElement>(".mini-menu-item--save")!;
    fireEvent.mouseDown(saveChangesButtonElement);

    expect(updateColumnTitleSpy).toHaveBeenCalledWith("Custom Title", expect.anything());
  });
});
