import React, {useEffect, useRef} from "react";
import {Database} from "emoji-picker-element";
import {useTranslation} from "react-i18next";
import {useAppDispatch, useAppSelector} from "store";
import {setSkinTone} from "store/features";
import {SkinToneName} from "store/features/skinTone/types";

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

const EmojiPicker: React.FC<EmojiPickerProps> = ({onEmojiClick, ...props}) => {
  const ref = useRef<HTMLElement>(null);
  const {i18n} = useTranslation();
  const dispatch = useAppDispatch();
  const currentSkinTone = useAppSelector((state) => state.skinTone.name);

  const lang = i18n.language.split("-")[0];
  const dataSourceUrl = `/emoji-data/${lang}.json`;

  useEffect(() => {
    const element = ref.current as unknown as {skinTone: number};
    const skinToneMapping: SkinToneName[] = ["default", "light", "medium_light", "medium", "medium_dark", "dark"];
    const skinToneIndex = skinToneMapping.indexOf(currentSkinTone);

    if (skinToneIndex !== -1) {
      // Update the internal database so the picker loads the correct skin tone on initialization
      const database = new Database({dataSource: dataSourceUrl});
      database.setPreferredSkinTone(skinToneIndex);

      if (element) {
        element.skinTone = skinToneIndex;
      }
    }
  }, [currentSkinTone, dataSourceUrl]);

  useEffect(() => {
    const element = ref.current;

    const handleEmojiClick = (event: Event) => {
      const customEvent = event as CustomEvent<EmojiClickData>;
      if (onEmojiClick) {
        onEmojiClick(customEvent.detail);
      }
    };

    const handleSkinToneChange = (event: Event) => {
      const customEvent = event as CustomEvent<SkinToneChangeData>;
      const skinToneIndex = customEvent.detail.skinTone;
      const skinToneMapping: SkinToneName[] = ["default", "light", "medium_light", "medium", "medium_dark", "dark"];

      if (skinToneIndex >= 0 && skinToneIndex < skinToneMapping.length) {
        dispatch(setSkinTone(skinToneMapping[skinToneIndex]));
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
  }, [onEmojiClick, dispatch]);

  return <emoji-picker ref={ref} data-source={dataSourceUrl} {...props} />;
};

export default EmojiPicker;
