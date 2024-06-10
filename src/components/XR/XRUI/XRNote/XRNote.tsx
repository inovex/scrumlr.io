/* eslint-disable react/no-unknown-property */
import {NoteProps} from "components/Note";
import {FONT_COLOR} from "components/XR/xr-constants";
import {useTranslation} from "react-i18next";
import store, {useAppSelector} from "store";
import {Participant} from "types/participant";
import {isEqual} from "underscore";
import {Container, ContainerProperties, Content, Root, Text} from "@react-three/uikit";
import {Card} from "components/apfel/card";
import {Grabbable} from "@coconut-xr/natuerlich/defaults";
import {useContext, useRef} from "react";
import {Euler, Object3D, Quaternion, Vector3} from "three";
import {Actions} from "store/action";
import {useFrame} from "@react-three/fiber";
import {DragContext, DragContextColumnType} from "../XRBoard/XRBoard";

const columnPosition = new Vector3();
const grabbablePositionVec = new Vector3();

const lerpSpeed = 0.1; // Adjust this value to control the speed of interpolation
const initialPosition = new Vector3(0, 0, 0);
const initialRotation = new Euler(0, 0, 0);
const initialQuaternion = new Quaternion().setFromEuler(initialRotation);

const XRNote = (props: NoteProps) => {
  const {t} = useTranslation();
  const grabbableRef = useRef<Object3D<any>>(null!);
  const staticCardRef = useRef<ContainerProperties>(null!);
  const dragCardRef = useRef<ContainerProperties>(null!);
  const drag = useRef(false);

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

  const setDragging = (dragging: boolean) => {
    drag.current = dragging;
    dragCardRef.current.setStyle({visibility: dragging ? "visible" : "hidden"});
    staticCardRef.current.setStyle({transformScaleX: dragging ? 0 : 1});
  };

  const handleRelease = () => {
    dragContext.note = undefined;

    if (!note || dragContext.over === note.position.column || !grabbableRef.current || !dragContext.over) return;

    store.dispatch(Actions.editNote(note.id, {position: {column: dragContext.over, stack: null, rank: 0}}));
    dragContext.over = undefined;
  };

  useFrame(() => {
    if (dragContext.note === grabbableRef.current) {
      const closestColumn = dragContext.columns.reduce(
        (closest: {column: DragContextColumnType | null; distance: number}, column: DragContextColumnType) => {
          columnPosition.setFromMatrixPosition(column.ref.interactionPanel.matrixWorld);
          const distance = columnPosition.distanceTo(grabbablePositionVec.setFromMatrixPosition(grabbableRef.current.matrixWorld));

          return distance < closest.distance ? {column, distance} : closest;
        },
        {column: null, distance: Infinity}
      );

      if (closestColumn.distance < 0.4) {
        dragContext.over = closestColumn.column?.props.id;
      } else dragContext.over = undefined;
    }
    if (!dragContext.note && grabbableRef.current && grabbableRef.current.position.distanceTo(initialPosition) > 0.001) {
      // TODO: lerp correctly if note is dragged to a new column
      grabbableRef.current.position.lerp(initialPosition, lerpSpeed);
      grabbableRef.current.quaternion.slerp(initialQuaternion, lerpSpeed);
    }
    if (!dragContext.note && grabbableRef.current && grabbableRef.current.position.distanceTo(initialPosition) <= 0.001 && drag.current) {
      setDragging(false);
    }
  });

  if (!note) return null;

  return (
    <Container height={96} width="100%">
      <Card
        ref={staticCardRef}
        borderRadius={16}
        transformTranslateZ={8}
        flexDirection="column"
        width={5120}
        height="100%"
        padding={12}
        overflow="scroll"
        gap={4}
        scrollbarWidth={0}
      >
        <Text fontSize={12} color={FONT_COLOR} marginBottom={0}>
          {authors[0]?.user.id === me?.user.id ? t("Note.you") : authors[0]?.user.name}
        </Text>
        <Text color={FONT_COLOR} fontSize={14} height="100%" wordBreak="break-all" verticalAlign="top">
          {note.text}
        </Text>
      </Card>
      <Content />
      <Grabbable
        ref={grabbableRef}
        maxGrabbers={1}
        onGrabbed={(e) => {
          dragContext.note = e;
          setDragging(true);
        }}
        onReleased={handleRelease}
      >
        <Root pixelSize={0.002}>
          <Container width={256} height={96}>
            <Card
              ref={dragCardRef}
              borderRadius={16}
              transformTranslateZ={8}
              flexDirection="column"
              width={256}
              height={96}
              padding={12}
              overflow="scroll"
              gap={4}
              scrollbarWidth={0}
              visibility="hidden"
            >
              <Text fontSize={12} color={FONT_COLOR} marginBottom={0}>
                {authors[0]?.user.id === me?.user.id ? t("Note.you") : authors[0]?.user.name}
              </Text>
              <Text color={FONT_COLOR} fontSize={14} height="100%" wordBreak="break-all" verticalAlign="top">
                {note.text}
              </Text>
            </Card>
          </Container>
        </Root>
      </Grabbable>
    </Container>
  );
};

export default XRNote;
