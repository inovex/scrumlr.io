import {createContext} from "react";
import {NoteContextType} from "types/note";

export const NoteContext = createContext<NoteContextType>({isFocused: false});
