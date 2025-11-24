import React, {useEffect, useRef} from "react";
import "emoji-picker-element";
import {useTranslation} from "react-i18next";

export interface EmojiClickData {
  annotation: string;
  order: number;
  shortcodes: string[];
  skinTone: number;
  tags: string[];
  unicode: string;
}

export interface SkinToneChangeData {
  skinTone: number;
}

interface EmojiPickerProps extends React.HTMLAttributes<HTMLElement> {
  onEmojiClick?: (emoji: EmojiClickData) => void;
  onSkinToneChange?: (skinTone: number) => void;
}

// This tells TypeScript that <emoji-picker> is a valid HTML tag.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "emoji-picker": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {"data-source"?: string}, HTMLElement>;
    }
  }
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({onEmojiClick, onSkinToneChange, ...props}) => {
  const ref = useRef<HTMLElement>(null);
  const {i18n} = useTranslation();

  const lang = i18n.language.split("-")[0];
  const dataSourceUrl = `/emoji-data/${lang}.json`;

  useEffect(() => {
    const element = ref.current;

    const handleEmojiClick = (event: Event) => {
      const customEvent = event as CustomEvent<EmojiClickData>;
      console.log(customEvent.detail.unicode);
      if (onEmojiClick) {
        onEmojiClick(customEvent.detail);
      }
    };

    const handleSkinToneChange = (event: Event) => {
      const customEvent = event as CustomEvent<SkinToneChangeData>;
      console.log(customEvent.detail.skinTone);
      if (onSkinToneChange) {
        onSkinToneChange(customEvent.detail.skinTone);
      }
    };

    if (element) {
      element.addEventListener("emoji-click", handleEmojiClick);
      element.addEventListener("skin-tone-change", handleSkinToneChange);
    }

    return () => {
      if (element) {
        element.removeEventListener("emoji-click", handleEmojiClick);
        element.removeEventListener("skin-tone-change", handleSkinToneChange);
      }
    };
  }, [onEmojiClick, onSkinToneChange]);

  return <emoji-picker ref={ref} data-source={dataSourceUrl} {...props} />;
};

export default EmojiPicker;
