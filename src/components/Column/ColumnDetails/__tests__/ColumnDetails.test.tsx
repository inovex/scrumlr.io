import {render} from "testUtils";
import {ColumnDetails, ColumnDetailsProps} from "components/Column/ColumnDetails/ColumnDetails";
import {Column, Participant, ParticipantRole} from "store/features";
import getTestApplicationState from "utils/test/getTestApplicationState";
import getTestStore from "utils/test/getTestStore";
import {Provider} from "react-redux";
import {fireEvent} from "@testing-library/react";

describe("ColumnDetails", () => {
  const renderColumnDetails = (overrideProps?: Partial<ColumnDetailsProps>, userRole: ParticipantRole = "OWNER") => {
    const defaultProps: ColumnDetailsProps = {
      column: getTestApplicationState().columns[0],
      notesCount: 1,
      mode: "view",
      isTemporary: false,
      changeMode: jest.fn(),
    };

    const props = {...defaultProps, ...overrideProps};
    const self: Participant = {...getTestApplicationState().participants.self!, role: userRole};

    return render(
      <Provider store={getTestStore({participants: {self}})}>
        <ColumnDetails {...props} />
      </Provider>
    );
  };

  it("should render correctly (view)", () => {
    const {container} = renderColumnDetails();
    expect(container).toMatchSnapshot();
  });

  it("should render correctly (edit)", () => {
    const {container} = renderColumnDetails({mode: "edit"});
    expect(container).toMatchSnapshot();
  });

  it("should switch to edit mode (self is moderator)", () => {
    const changeModeSpy = jest.fn();
    const {container} = renderColumnDetails({changeMode: changeModeSpy});
    const columnDetailNameNode = container.querySelector<HTMLDivElement>(".column-details__name")!;

    fireEvent.doubleClick(columnDetailNameNode);
    expect(changeModeSpy).toHaveBeenCalledWith("edit");
  });

  it("should not switch to edit mode (self is participant)", () => {
    const changeModeSpy = jest.fn();
    const {container} = renderColumnDetails({changeMode: changeModeSpy}, "PARTICIPANT");
    const columnDetailNameNode = container.querySelector<HTMLDivElement>(".column-details__name")!;

    fireEvent.doubleClick(columnDetailNameNode);
    expect(changeModeSpy).not.toHaveBeenCalledWith("edit");
  });
});
