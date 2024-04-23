import {Container, Text} from "@coconut-xr/koestlich";
import {ColumnProps} from "components/Column";
import {FONT_COLOR, getColorFromName} from "components/XR/xr-constants";
import {useAppSelector} from "store";
import _ from "underscore";

const XRColumn = (props: ColumnProps) => {
  const notes = useAppSelector(
    (state) =>
      state.notes
        ? state.notes
            .filter((note) => !note.position.stack)
            .filter((note) => (state.board.data?.showNotesOfOtherUsers || state.auth.user!.id === note.author) && note.position.column === props.id)
            .map((note) => note.id)
        : [],
    _.isEqual
  );

  return (
    <Container index={props.index} flexGrow={1} flexDirection="column" alignItems="center" margin={0} border={4} borderColor={getColorFromName(props.color)}>
      <Text color={FONT_COLOR} margin={16}>
        {props.name} {notes.length.toString()}
      </Text>
      {notes.map((note) => (
        <Text>{note}</Text>
      ))}
    </Container>
  );
};

export default XRColumn;
