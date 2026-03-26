import type {DetailedHTMLProps, HTMLAttributes} from "react";
import type {Picker} from "emoji-picker-element";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "emoji-picker": DetailedHTMLProps<
        HTMLAttributes<Picker> & {
          class?: string;
          locale?: string;
          "data-source"?: string;
        },
        Picker
      >;
    }
  }
}
