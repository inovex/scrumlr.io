import {BoardOption} from "./BoardOption";
import {BoardOptionButton} from "./BoardOptionButton";
import {BoardOptionToggle} from "./BoardOptionToggle";
import "../BoardSettings/BoardSettings.scss";

export const LockBoard = () => 
  // const {t} = useTranslation();

   (
    <BoardOption>
      <BoardOptionButton label="Allow changes" onClick={() => {}}>
        <BoardOptionToggle active />
      </BoardOptionButton>
    </BoardOption>
  )
;
