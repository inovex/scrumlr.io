import {ColumnConfiguratorColumnNameDetails, ColumnConfiguratorColumnNameDetailsProps} from "../ColumnConfiguratorColumnNameDetails";
import {render} from "testUtils";
import {fireEvent} from "@testing-library/react";

const renderColumnConfiguratorColumnNameDetails = (override?: Partial<ColumnConfiguratorColumnNameDetailsProps>) => {
  const defaultProps: ColumnConfiguratorColumnNameDetailsProps = {
    className: "column-configurator-column-name-details",
    name: "Default Name",
    description: "Default Description",
    openState: "closed",
    setOpenState: vi.fn(),
    updateColumnTitle: vi.fn(),
  };

  return <ColumnConfiguratorColumnNameDetails {...defaultProps} {...override} />;
};

describe("ColumnConfiguratorColumnNameDetails render", () => {
  it("should render correctly (closed)", () => {
    const {container} = render(renderColumnConfiguratorColumnNameDetails({openState: "closed"}));
    expect(container).toMatchSnapshot();
  });

  it("should render correctly (visualFeedback)", () => {
    const {container} = render(renderColumnConfiguratorColumnNameDetails({openState: "visualFeedback"}));
    expect(container).toMatchSnapshot();
  });

  it("should render correctly (nameFirst)", () => {
    const {container} = render(renderColumnConfiguratorColumnNameDetails({openState: "nameFirst"}));
    expect(container).toMatchSnapshot();
  });

  it("should render correctly (descriptionFirst)", () => {
    const {container} = render(renderColumnConfiguratorColumnNameDetails({openState: "descriptionFirst"}));
    expect(container).toMatchSnapshot();
  });

  it("should match title and description", () => {
    const name = "Custom Title";
    const description = "Custom Description";
    const {container} = render(renderColumnConfiguratorColumnNameDetails({name, description}));

    expect(container.querySelector<HTMLInputElement>(".column-configurator-column-name-details__name")).toHaveValue(name);
    expect(container.querySelector<HTMLDivElement>(".column-configurator-column-name-details__inline-description")).toHaveTextContent(description);
  });
});

describe("ColumnConfiguratorColumnNameDetails behaviour", () => {
  it("should make title editable after focusing", () => {
    const setOpenStateSpy = vi.fn();
    const {container, rerender} = render(renderColumnConfiguratorColumnNameDetails({openState: "closed", setOpenState: setOpenStateSpy}));

    const inputElement = container.querySelector<HTMLInputElement>(".column-configurator-column-name-details__name")!;

    expect(inputElement).not.toHaveFocus();

    fireEvent.focus(inputElement);

    expect(setOpenStateSpy).toHaveBeenCalledWith("nameFirst");

    rerender(renderColumnConfiguratorColumnNameDetails({openState: "nameFirst"}));

    expect(inputElement).toHaveClass("column-configurator-column-name-details__name--editing");
  });

  it("should make description editable after clicking", () => {
    const setOpenStateSpy = vi.fn();
    const {container, rerender} = render(renderColumnConfiguratorColumnNameDetails({openState: "closed", setOpenState: setOpenStateSpy}));

    const inlineDescriptionElement = container.querySelector<HTMLDivElement>(".column-configurator-column-name-details__inline-description")!;

    expect(inlineDescriptionElement).toBeInTheDocument();

    fireEvent.click(inlineDescriptionElement);

    expect(setOpenStateSpy).toHaveBeenCalledWith("descriptionFirst");
    rerender(renderColumnConfiguratorColumnNameDetails({openState: "descriptionFirst"}));

    expect(container.querySelector(".column-configurator-column-name-details__inline-description")).not.toBeInTheDocument();
  });

  it("should close after losing focus", () => {
    const setOpenStateSpy = vi.fn();
    const {container} = render(renderColumnConfiguratorColumnNameDetails({openState: "nameFirst", setOpenState: setOpenStateSpy}));

    // note: useOnBlur does not actually use the native blur event, but scans for clicks outside the element instead.
    // this is why to simulate the blur, we just click somewhere on the document.
    // const wrapperElement = container.firstChild as HTMLDivElement
    // fireEvent.blur(wrapperElement);
    fireEvent.click(document);

    expect(setOpenStateSpy).toHaveBeenCalledWith("closed");
  });

  it("should close without saving when there are no actual changes", () => {
    const setOpenStateSpy = vi.fn();
    const {container} = render(renderColumnConfiguratorColumnNameDetails({openState: "nameFirst", setOpenState: setOpenStateSpy}));

    const saveChangesButtonElement = container.querySelector<HTMLButtonElement>(".mini-menu-item--save")!;
    fireEvent.mouseDown(saveChangesButtonElement);

    expect(setOpenStateSpy).toHaveBeenCalledWith("closed");
  });

  it("should set openState to visualFeedback, then to closed upon confirming changes", () => {
    vi.useFakeTimers();
    const setOpenStateSpy = vi.fn();
    const updateColumnTitleSpy = vi.fn();
    const {container} = render(renderColumnConfiguratorColumnNameDetails({openState: "nameFirst", setOpenState: setOpenStateSpy, updateColumnTitle: updateColumnTitleSpy}));

    // make sure to insert actual changes
    const inputElement = container.querySelector<HTMLInputElement>(".column-configurator-column-name-details__name")!;
    fireEvent.input(inputElement, {target: {value: "Custom Title"}});

    const saveChangesButtonElement = container.querySelector<HTMLButtonElement>(".mini-menu-item--save")!;
    fireEvent.mouseDown(saveChangesButtonElement);

    expect(setOpenStateSpy).toHaveBeenCalledWith("visualFeedback");
    expect(updateColumnTitleSpy).toHaveBeenCalledWith("Custom Title", expect.anything());

    setTimeout(() => {
      expect(setOpenStateSpy).toHaveBeenCalledWith("closed");
    }, 2000);

    vi.runAllTimers();
  });

  it("should call save changes with new input title", () => {
    const updateColumnTitleSpy = vi.fn();
    const {container} = render(renderColumnConfiguratorColumnNameDetails({openState: "nameFirst", updateColumnTitle: updateColumnTitleSpy}));

    const inputElement = container.querySelector<HTMLInputElement>(".column-configurator-column-name-details__name")!;
    fireEvent.input(inputElement, {target: {value: "Custom Title"}});

    const saveChangesButtonElement = container.querySelector<HTMLButtonElement>(".mini-menu-item--save")!;
    fireEvent.mouseDown(saveChangesButtonElement);

    expect(updateColumnTitleSpy).toHaveBeenCalledWith("Custom Title", expect.anything());
  });

  it("should also save after pressing enter", () => {
    const updateColumnTitleSpy = vi.fn();
    const {container} = render(renderColumnConfiguratorColumnNameDetails({openState: "nameFirst", updateColumnTitle: updateColumnTitleSpy}));

    const inputElement = container.querySelector<HTMLInputElement>(".column-configurator-column-name-details__name")!;
    fireEvent.input(inputElement, {target: {value: "Custom Title"}});

    fireEvent.keyUp(inputElement, {key: "Enter"});

    expect(updateColumnTitleSpy).toHaveBeenCalledWith("Custom Title", expect.anything());
  });

  it("should reset after pressing escape", () => {
    const updateColumnTitleSpy = vi.fn();
    const setOpenStateSpy = vi.fn();
    const {container} = render(renderColumnConfiguratorColumnNameDetails({openState: "nameFirst", setOpenState: setOpenStateSpy, updateColumnTitle: updateColumnTitleSpy}));

    const inputElement = container.querySelector<HTMLInputElement>(".column-configurator-column-name-details__name")!;
    fireEvent.input(inputElement, {target: {value: "Custom Title"}});

    fireEvent.keyUp(inputElement, {key: "Escape"});

    expect(updateColumnTitleSpy).not.toHaveBeenCalled();
    expect(setOpenStateSpy).toHaveBeenCalledWith("closed");
  });
});
