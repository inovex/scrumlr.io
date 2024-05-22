import {Container, Text, TextProperties} from "@react-three/uikit";
import {ColumnProps} from "components/Column";
import {FONT_COLOR, getColorFromName} from "components/XR/xr-constants";
import {useAppSelector} from "store";
import _ from "underscore";
import {useRef} from "react";
import XRNote from "../XRNote/XRNote";
import XRInputField from "../XRInputField/XRInputField";

const XRColumn = (props: ColumnProps) => {
  const columnNameRef = useRef<TextProperties>(null!);

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
      flexGrow={1}
      flexDirection="column"
      alignItems="flex-start"
      margin={0}
      padding={16}
      paddingTop={64}
      minWidth="30%"
      flexBasis={1}
      borderColor={getColorFromName(props.color)}
      borderOpacity={0.8}
      borderWidth={4}
      borderRightWidth={!isLastColumn ? 0 : 4}
      borderLeftWidth={!isFirstColumn ? 0 : 4}
      borderLeftRadius={isFirstColumn ? 26 : 0}
      borderRightRadius={isLastColumn ? 26 : 0}
    >
      <Text ref={columnNameRef} color={FONT_COLOR} marginBottom={4} borderBottom={4} borderColor={getColorFromName(props.color)}>
        {props.name}
      </Text>
      <Container height={4} width={columnNameRef.current?.size?.v?.[0] ?? "50%"} marginBottom={8} backgroundColor={getColorFromName(props.color)} />
      <XRInputField columnIndex={props.index} columnId={props.id} columnColor={props.color} />
      <Container width="100%" height="80%" marginTop={16} flexDirection="column" gap={8} overflow="scroll" paddingBottom={32} scrollbarWidth={0}>
        {notes.map((note) => (
          <XRNote key={note} noteId={note} viewer={viewer} />
        ))}
      </Container>
    </Container>
  );
};

export default XRColumn;
