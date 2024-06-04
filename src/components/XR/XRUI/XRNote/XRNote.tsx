/* eslint-disable react/no-unknown-property */
import {NoteProps} from "components/Note";
import {FONT_COLOR} from "components/XR/xr-constants";
import {useTranslation} from "react-i18next";
import store, {useAppSelector} from "store";
import {Participant} from "types/participant";
import {isEqual} from "underscore";
import {Container, Content, Root, Text} from "@react-three/uikit";
import {Card} from "components/apfel/card";
import {Grabbable} from "@coconut-xr/natuerlich/defaults";
import {useContext, useRef, useState} from "react";
import {Object3D, Vector3} from "three";
import {Actions} from "store/action";
import {DragContext, DragContextColumnType} from "../XRBoard/XRBoard";

const columnPosition = new Vector3();
const grabbablePositionVec = new Vector3();

const XRNote = (props: NoteProps) => {
  const {t} = useTranslation();
  const [dragging, setDragging] = useState(false);
  const grabbableRef = useRef<Object3D<any>>(null!);

  const dragContext = useContext(DragContext);

  const {note, me} = useAppSelector((state) => ({
    note: state.notes.find((n) => n.id === props.noteId),
    me: state.participants!.self,
  }));

  const authors = useAppSelector((state) => {
    const allUsers = state.participants?.others.concat(state.participants?.self);
    const noteAuthor = allUsers?.find((p) => p.user.id === note?.author);
    const childrenNoteAuthors = state.notes.filter((n) => n.position.stack === props.noteId).map((c) => allUsers?.find((p) => p.user.id === c.author));

    return [noteAuthor, ...childrenNoteAuthors].filter(Boolean) as Participant[];
  }, isEqual);

  if (!note) return null;

  return (
    <Container height={96} width="100%">
      {!dragging && (
        <Card borderRadius={16} transformTranslateZ={8} flexDirection="column" width={5120} height="100%" padding={12} overflow="scroll" gap={4} scrollbarWidth={0}>
          <Text fontSize={12} color={FONT_COLOR} marginBottom={0}>
            {authors[0]?.user.id === me?.user.id ? t("Note.you") : authors[0]?.user.name}
          </Text>
          <Text color={FONT_COLOR} fontSize={14} height="100%" wordBreak="break-all" verticalAlign="top">
            {note.text}
          </Text>
        </Card>
      )}
      <Content />
      <Grabbable
        ref={grabbableRef}
        onGrabbed={(e) => {
          dragContext.dragging = true;
          setDragging(true);
        }}
        onReleased={(e) => {
          dragContext.dragging = false;

          if (grabbableRef.current) {
            const closestColumn = dragContext.columns.reduce(
              (closest: {column: DragContextColumnType | null; distance: number}, column: DragContextColumnType) => {
                columnPosition.setFromMatrixPosition(column.ref.interactionPanel.matrixWorld);
                const distance = columnPosition.distanceTo(grabbablePositionVec.setFromMatrixPosition(e.matrixWorld));

                return distance < closest.distance ? {column, distance} : closest;
              },
              {column: null, distance: Infinity}
            );

            if (closestColumn.distance < 0.4) {
              store.dispatch(Actions.editNote(note.id, {position: {column: closestColumn.column!.props.id, stack: null, rank: 0}}));
            } else e.position.set(0, 0, 0);

            setDragging(false);
          }
        }}
      >
        <Root pixelSize={0.002}>
          <Container width={256} height={96}>
            {dragging && (
              <Card borderRadius={16} transformTranslateZ={8} flexDirection="column" width={256} height={96} padding={12} overflow="scroll" gap={4} scrollbarWidth={0}>
                <Text fontSize={12} color={FONT_COLOR} marginBottom={0}>
                  {authors[0]?.user.id === me?.user.id ? t("Note.you") : authors[0]?.user.name}
                </Text>
                <Text color={FONT_COLOR} fontSize={14} height="100%" wordBreak="break-all" verticalAlign="top">
                  {note.text}
                </Text>
              </Card>
            )}
          </Container>
        </Root>
      </Grabbable>
    </Container>
  );
};

export default XRNote;
