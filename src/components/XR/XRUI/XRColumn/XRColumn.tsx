import {Container, Text} from "@coconut-xr/koestlich";
import {ColumnProps} from "components/Column";
import {FONT_COLOR, getColorFromName} from "components/XR/xr-constants";
import {useAppSelector} from "store";
import _ from "underscore";
import XRNote from "../XRNote/XRNote";

const XRColumn = (props: ColumnProps) => {
  const {notes, viewer, numberOfColumns} = useAppSelector(
    (state) => ({
      notes: state.notes
        ? state.notes
            .filter((note) => !note.position.stack)
            .filter((note) => (state.board.data?.showNotesOfOtherUsers || state.auth.user!.id === note.author) && note.position.column === props.id)
            .map((note) => note.id)
        : [],
      viewer: state.participants!.self,
      numberOfColumns: state.columns.length,
    }),
    _.isEqual
  );

  const isFirstColumn = props.index === 0;
  const isLastColumn = props.index === numberOfColumns - 1;

  return (
    <Container
      index={props.index}
      flexGrow={1}
      flexDirection="column"
      alignItems="flex-start"
      margin={0}
      padding={32}
      paddingTop={96}
      border={4}
      borderRight={!isLastColumn ? 0 : 4}
      borderLeft={!isFirstColumn ? 0 : 4}
      borderRadiusLeft={isFirstColumn ? 26 : 0}
      borderRadiusRight={isLastColumn ? 26 : 0}
      borderBend={32}
      minWidth="30%"
      flexBasis={1}
      borderColor={getColorFromName(props.color)}
    >
      <Text color={FONT_COLOR} marginBottom={16} borderBottom={4} borderColor={getColorFromName(props.color)}>
        {props.name}
      </Text>
      <Container width="100%" height="100%" flexDirection="column" overflow="scroll" paddingBottom={32}>
        {notes.map((note) => (
          <XRNote key={note} noteId={note} viewer={viewer} />
        ))}
      </Container>
    </Container>
  );
};

export default XRColumn;
