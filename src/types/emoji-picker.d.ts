import {DetailedHTMLProps, HTMLAttributes} from "react";
import {Picker} from "emoji-picker-element";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "emoji-picker": DetailedHTMLProps<
        HTMLAttributes<Picker> & {
          class?: string;
          locale?: string;
        },
        Picker
      >;
    }
  }
}
