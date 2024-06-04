import {Container} from "@react-three/uikit";
import {shallowEqual} from "react-redux";
import {useAppSelector} from "store";
import {createContext} from "react";
import {ColumnProps} from "components/Column";
import XRColumn from "../XRColumn/XRColumn";

export type DragContextColumnType = {
  ref: any;
  props: ColumnProps;
};

type DragContextType = {
  dragging: boolean;
  columns: DragContextColumnType[];
};

export const DragContext = createContext<DragContextType>({
  dragging: false,
  columns: [],
});

const defaultDragValue = {
  dragging: false,
  columns: [],
};

const XRBoard = () => {
  const {columns, participants} = useAppSelector(
    (rootState) => ({
      columns: rootState.columns,
      participants: rootState.participants,
    }),
    shallowEqual
  );

  const currentUserIsModerator = participants?.self.role === "OWNER" || participants?.self.role === "MODERATOR";

  return (
    <Container flexGrow={1} width="100%" height="100%" flexDirection="row" margin={0} border={2} overflow="scroll" scrollbarWidth={0}>
      <DragContext.Provider value={defaultDragValue}>
        {columns
          .filter((column) => column.visible || (currentUserIsModerator && participants?.self.showHiddenColumns))
          .map((column) => (
            <XRColumn key={column.id} id={column.id} index={column.index} name={column.name} visible={column.visible} color={column.color} />
          ))}
      </DragContext.Provider>
    </Container>
  );
};

export default XRBoard;
