import {useTranslation} from "react-i18next";
import {Warning} from "components/Icon";
import {useAppSelector} from "store";
import "./ExportHintHiddenContent.scss";
import {isEqual} from "underscore";

const ExportHintHiddenContent = () => {
  const {t} = useTranslation();

  const hiddenColumns = useAppSelector((state) => state.columns.filter((col) => !col.visible), isEqual);
  const showNotesOfOtherParticipants = useAppSelector((state) => state.board.data?.showNotesOfOtherUsers);

  if (hiddenColumns.length || !showNotesOfOtherParticipants) {
    return (
      <div className="hint-hidden-columns__grid-container">
        <Warning className="hint-hidden-columns__info-icon" />
        {hiddenColumns.length > 0 && (
          <>
            <span className="hint-hidden-columns__info-text">{t("ExportBoardOption.hintHiddenColumns")}</span>
            <div className="hint-hidden-columns__columns-list-container">
              <ul className="hint-hidden-columns__columns-list">
                {hiddenColumns.map((hiddenCol) => (
                  <li key={hiddenCol.id}>{hiddenCol.name}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        {!showNotesOfOtherParticipants && <span className="hint-hidden-columns__info-text">{t("ExportBoardOption.hintHiddenNotes")}</span>}
      </div>
    );
  }
  return null;
};

export default ExportHintHiddenContent;
