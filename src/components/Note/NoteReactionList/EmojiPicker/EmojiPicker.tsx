import React, {useEffect, useRef, useState} from "react";
import {Database, Picker} from "emoji-picker-element";
import {useTranslation} from "react-i18next";
import {useAppDispatch, useAppSelector} from "store";
import {setSkinTone, skinTones} from "store/features";
import {SkinToneName} from "store/features/skinTone/types";
import {useAutoTheme} from "utils/hooks/useAutoTheme";
import {AppLanguage} from "i18n";
import {I18n} from "emoji-picker-element/shared";
import "./EmojiPicker.scss";

export interface EmojiClickData {
  emoji: {
    annotation: string;
    group: number;
    order: number;
    shortcodes: string[];
    tags: string[];
    unicode: string;
    version: number;
  };
  skinTone: number;
  unicode: string;
}

export interface SkinToneChangeData {
  skinTone: number;
}

interface EmojiPickerProps extends React.HTMLAttributes<HTMLElement> {
  onEmojiClick: (e: Event, unicode: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({onEmojiClick, ...props}) => {
  const ref = useRef<Picker>(null);
  const [isReady, setIsReady] = useState(false);
  const {i18n} = useTranslation();
  const dispatch = useAppDispatch();
  const currentSkinTone = useAppSelector((state) => state.skinTone.name);
  const theme = useAppSelector((state) => state.view.theme);
  const autoTheme = useAutoTheme(theme);

  const lang = i18n.resolvedLanguage as AppLanguage;
  const dataSourceUrl = `${process.env.PUBLIC_URL}/emoji-data/${lang}.json`;
  const skinToneMapping = Object.keys(skinTones) as SkinToneName[];
  const skinToneIndex = Math.max(0, skinToneMapping.indexOf(currentSkinTone));

  useEffect(() => {
    // Update the internal database so the picker loads the correct skin tone on initialization
    const database = new Database({dataSource: dataSourceUrl, locale: lang});
    database.setPreferredSkinTone(skinToneIndex).then(() => {
      setIsReady(true);
    });

    return () => {
      database.close();
    };
  }, [skinToneIndex, dataSourceUrl, lang]);

  useEffect(() => {
    const element = ref.current;

    if (element) {
      import(`emoji-picker-element/i18n/${lang}.js`) // .js suffix required because of bundling of dynamic import resolution
        .then(({default: i18ndefault}: {default: I18n}) => {
          element.i18n = i18ndefault;
        });
    }

    const handleEmojiClick = (event: Event) => {
      const customEvent = event as CustomEvent<EmojiClickData>;
      // this is the styled emoji unicode (with skin Tone included), TODO(#5638): access customEvent.detail.emoji.unicode for unstyled/default unicode character
      onEmojiClick(event, customEvent.detail.unicode);
    };

    const handleSkinToneChange = (event: Event) => {
      const customEvent = event as CustomEvent<SkinToneChangeData>;
      const newSkinToneIndex = customEvent.detail.skinTone;

      if (newSkinToneIndex >= 0 && newSkinToneIndex < skinToneMapping.length) {
        dispatch(setSkinTone(skinToneMapping[newSkinToneIndex]));
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
  }, [onEmojiClick, dispatch, isReady, lang, skinToneMapping]);

  // Manually overriding the emoji-picker base styles (via shadow dom)
  useEffect(() => {
    const picker = ref.current;
    if (!picker || !picker?.shadowRoot) return;

    // Remove the favorites bar at the bottom
    const menuElement = picker.shadowRoot.querySelector('div[role="menu"]');
    if (menuElement) {
      menuElement.remove();
    }

    // Inject custom styles into the shadow DOM
    const styleId = "custom-emoji-picker-styles";
    if (!picker.shadowRoot.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        #search {
          border: 1px solid transparent;
        }
        #search:hover {
          border: 1px solid #586073; /* $navy--200 */
        }
        :host(.light) #search {
          background-color: #F4F4F6; /* $gray--200 */
        }
        :host(.dark) #search {
          background-color: #373e4f; /* $navy--400 */
        }

        @media screen and (min-width: 768px) {
          .pad-top {
            height: 20px;
          }
          .search-row {
            padding: 0 20px;
          }
          div.nav {
            padding: 0 20px;
          }
          div.indicator-wrapper {
            padding: 0 20px;
          }
          div[role="tabpanel"] {
            padding: 0 7px 0 20px;
          }
        }
      `;
      picker.shadowRoot.appendChild(style);
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return <emoji-picker ref={ref} class={(theme === "auto" ? autoTheme : theme) as string} data-source={dataSourceUrl} locale={lang} {...props} />;
};

export default EmojiPicker;
