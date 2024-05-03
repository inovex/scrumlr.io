import {Container, Text, Object} from "@coconut-xr/koestlich";
import {NoteProps} from "components/Note";
import {FONT_COLOR} from "components/XR/xr-constants";
import {Suspense, useMemo} from "react";
import {useTranslation} from "react-i18next";
import {useAppSelector} from "store";
import {Participant} from "types/participant";
import {isEqual} from "underscore";
import {ExtrudeGeometry, Mesh, Shape} from "three";
import {GlassMaterial} from "../XRContainer/XRContainer";

class CardGeometry extends ExtrudeGeometry {
  constructor(width: number, height: number, radius: number) {
    const roundedRectShape = new Shape();
    roundedRectShape.moveTo(0, radius);
    roundedRectShape.lineTo(0, height - radius);
    roundedRectShape.quadraticCurveTo(0, height, radius, height);
    roundedRectShape.lineTo(width - radius, height);
    roundedRectShape.quadraticCurveTo(width, height, width, height - radius);
    roundedRectShape.lineTo(width, radius);
    roundedRectShape.quadraticCurveTo(width, 0, width - radius, 0);
    roundedRectShape.lineTo(radius, 0);
    roundedRectShape.quadraticCurveTo(0, 0, 0, radius);
    super(roundedRectShape, {depth: 1, bevelEnabled: false});
  }
}

const XRNote = (props: NoteProps) => {
  const {t} = useTranslation();

  const mesh1 = useMemo(() => new Mesh(new CardGeometry(1, 1, 0.08), new GlassMaterial()), []);

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
    <Suspense>
      <Container>
        <Object depth={4} object={mesh1} opacity={0.3} marginBottom={8} index={note.position.rank * -1}>
          <Container flexDirection="column" backgroundColor={undefined} width="100%" margin={0} padding={12} overflow="scroll">
            <Text fontSize={10} color={FONT_COLOR}>
              {authors[0]?.user.id === me?.user.id ? t("Note.you") : authors[0]?.user.name}
            </Text>
            <Text color={FONT_COLOR} fontSize={12} height={64}>
              {note.text}
            </Text>
          </Container>
        </Object>
      </Container>
    </Suspense>
  );
};

export default XRNote;
