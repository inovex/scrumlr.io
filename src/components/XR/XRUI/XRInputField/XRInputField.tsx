import {Container, Text} from "@react-three/uikit";
import {useXR} from "@coconut-xr/natuerlich/react";
import {useEffect, useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {getColorFromName} from "components/XR/xr-constants";
import {Color} from "constants/colors";
import {GlassMaterial, colors} from "../../../apfel/theme";

type XRInputFieldProps = {columnIndex: number; columnId: string; columnColor: Color};

const XRInputField = ({columnIndex, columnId, columnColor}: XRInputFieldProps) => {
  const dispatch = useDispatch();
  const {session} = useXR();
  const [inputText, setInputText] = useState("");
  const [focus, setFocus] = useState(false);
  const [showCaret, setShowCaret] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange = (inputEvent: Event) => {
    setInputText((inputEvent.target as HTMLTextAreaElement).value);
  };

  const handleSubmit = (inputEvent: Event) => {
    dispatch(Actions.addNote(columnId, (inputEvent.target as HTMLTextAreaElement).value));
    setInputText("");
    setFocus(false);
  };

  useEffect(() => {
    inputRef.current = document.getElementById(`note-input-${columnIndex}`) as HTMLTextAreaElement;

    if (inputRef.current) {
      inputRef.current.addEventListener("input", handleInputChange);
      inputRef.current.addEventListener("change", handleSubmit);
    }

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener("input", handleInputChange);
        inputRef.current.removeEventListener("change", handleSubmit);
      }
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCaret((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleFocus = () => {
    setFocus(true);
    if (session?.isSystemKeyboardSupported && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Container
      panelMaterialClass={GlassMaterial}
      height={32}
      borderRadius={32}
      borderWidth={2}
      borderBend={-0.3}
      borderColor={!focus ? colors.card : getColorFromName(columnColor)}
      borderOpacity={0.2}
      width="100%"
      padding={4}
      paddingLeft={8}
      backgroundColor={colors.background}
      hover={{backgroundColor: colors.backgroundHover}}
      backgroundOpacity={0.2}
      onClick={handleFocus} // TODO: right now only focusing the input is supported, no blur event
    >
      <Text fontWeight={500}>{focus ? `${inputText}${showCaret ? "|" : ""}` : "Tap to input text"}</Text>
    </Container>
  );
};

export default XRInputField;
