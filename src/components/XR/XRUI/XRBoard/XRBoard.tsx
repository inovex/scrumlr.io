import {Container} from "@coconut-xr/koestlich";
import {Suspense} from "react";
import {shallowEqual} from "react-redux";
import {useAppSelector} from "store";
import XRColumn from "../XRColumn/XRColumn";

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
    <Suspense>
      <Container index={1} flexGrow={1} flexDirection="row" margin={0}>
        {columns
          .filter((column) => column.visible || (currentUserIsModerator && participants?.self.showHiddenColumns))
          .map((column) => (
            <XRColumn key={column.id} id={column.id} index={column.index} name={column.name} visible={column.visible} color={column.color} />
          ))}
      </Container>
    </Suspense>
  );
};

export default XRBoard;
