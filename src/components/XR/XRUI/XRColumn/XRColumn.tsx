import {Container, Text} from "@coconut-xr/koestlich";
import {ColumnProps} from "components/Column";
import {FONT_COLOR, getColorFromName} from "components/XR/xr-constants";
import {useAppSelector} from "store";
import _ from "underscore";
import XRNote from "../XRNote/XRNote";

const XRColumn = (props: ColumnProps) => {
  const {notes, viewer} = useAppSelector(
    (state) => ({
      notes: state.notes
        ? state.notes
            .filter((note) => !note.position.stack)
            .filter((note) => (state.board.data?.showNotesOfOtherUsers || state.auth.user!.id === note.author) && note.position.column === props.id)
            .map((note) => note.id)
        : [],
      viewer: state.participants!.self,
    }),
    _.isEqual
  );

  return (
    <Container
      index={props.index}
      flexGrow={1}
      flexDirection="column"
      alignItems="flex-start"
      margin={0}
      padding={32}
      paddingTop={128}
      border={4}
      minWidth="30%"
      flexBasis={1}
      borderColor={getColorFromName(props.color)}
    >
      <Text color={FONT_COLOR} marginBottom={16} borderBottom={4} borderColor={getColorFromName(props.color)}>
        {props.name}
      </Text>
      <Container width="100%" height="auto" flexDirection="column" gapRow={8}>
        {notes.map((note) => (
          <XRNote key={note} noteId={note} viewer={viewer} />
        ))}
      </Container>
    </Container>
  );
};

export default XRColumn;
