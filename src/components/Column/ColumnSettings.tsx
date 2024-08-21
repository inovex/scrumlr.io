import {Dispatch, FC, SetStateAction, useState} from "react";
import {Actions} from "store/action";
import {Hidden, Visible, Edit, ArrowLeft, ArrowRight, Trash, Close} from "components/Icon";
import {Color, getColorForIndex, COLOR_ORDER} from "constants/colors";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import "./ColumnSettings.scss";
import "./ColorPicker.scss";
import {useAppSelector} from "store";
import {useOnBlur} from "utils/hooks/useOnBlur";
// import {Tooltip} from "react-tooltip";
import {MiniMenu} from "components/MiniMenu/MiniMenu";
import {Toast} from "../../utils/Toast";
import {TEMPORARY_COLUMN_ID, TOAST_TIMER_SHORT} from "../../constants/misc";
// import {ColorPicker, ColorPickerDyn} from "./ColorPicker";
import {ColorPicker} from "./ColorPicker";

type ColumnSettingsProps = {
  id: string;
  name: string;
  color: Color;
  visible: boolean;
  index: number;
  onClose?: () => void;
  onNameEdit?: () => void;
  setOpenColumnSet?: Dispatch<SetStateAction<boolean>>;
};

export const ColumnSettings: FC<ColumnSettingsProps> = ({id, name, color, visible, index, onClose, onNameEdit, setOpenColumnSet}) => {
  const {t} = useTranslation();
  const showHiddenColumns = useAppSelector((state) => state.participants?.self.showHiddenColumns);
  const dispatch = useDispatch();
  const columnSettingsRef = useOnBlur(onClose ?? (() => {}));
  const [openedColorPicker, setOpenedColorPicker] = useState(false);

  const handleAddColumn = (columnIndex: number) => {
    if (!showHiddenColumns) {
      dispatch(Actions.setShowHiddenColumns(true));
      Toast.success({title: t("Toast.hiddenColumnsVisible"), autoClose: TOAST_TIMER_SHORT});
    }
    const randomColor = getColorForIndex(Math.floor(Math.random() * 100));
    dispatch(Actions.createColumnOptimistically({id: TEMPORARY_COLUMN_ID, name: "", color: randomColor, visible: false, index: columnIndex}));
  };

  // const renderColorPicker = () =>
  //   openedColorPicker ? (
  //     <ColorPicker id={id} name={name} visible={visible} index={index} color={color} onClose={onClose} />
  //   ) : (
  //     <span className={`column__header-color-option ${color}_selected`} />
  //   );

  const renderColorPickerDyn = () =>
    openedColorPicker ? (
      <ColorPicker id={id} name={name} visible={visible} index={index} color={color} onClose={onClose} colors={COLOR_ORDER} />
    ) : (
      <span className={`column__header-color-option ${color}_selected`} />
    );

  return (
    <div ref={columnSettingsRef}>
      {/* className="column__header-menu-dropdown" */}
      <MiniMenu
        className=""
        items={[
          {
            label: t("Column.deleteColumn"),
            icon: <Trash />,
            onClick: () => {
              onClose?.();
              dispatch(Actions.deleteColumn(id));
            },
          },
          {label: t("Column.color"), icon: renderColorPickerDyn(), onClick: () => setOpenedColorPicker((o) => !o)},
          {
            label: t("Column.addColumnLeft"),
            icon: <ArrowLeft />,
            onClick: () => {
              onClose?.();
              handleAddColumn(index);
            },
          },
          {
            label: t("Column.addColumnRight"),
            icon: <ArrowRight />,
            onClick: () => {
              onClose?.();
              handleAddColumn(index + 1);
            },
          },
          {
            label: visible ? t("Column.hideColumn") : t("Column.showColumn"),
            icon: visible ? <Hidden /> : <Visible />,
            onClick: () => {
              onClose?.();
              dispatch(Actions.editColumn(id, {name, color, index, visible: !visible}));
            },
          },
          {
            label: t("Column.editName"),
            icon: <Edit />,
            onClick: () => {
              onNameEdit?.();
              onClose?.();
            },
          },
          {
            label: t("Column.resetName"),
            icon: <Close />,
            onClick: () => (setOpenColumnSet ? setOpenColumnSet((o) => !o) : () => {}),
          },
        ]}
      />

      {/* <ul id="cwwwwwww"> */}
      {/*   <li> */}
      {/*   <button */}
      {/*       onClick={() => { */}
      {/*         onClose?.(); */}
      {/*         dispatch(Actions.deleteColumn(id)); */}
      {/*       }} */}
      {/*       title={t("Column.deleteColumn")} */}
      {/*     > */}
      {/*       <Trash /> */}
      {/*       /!* {t("Column.deleteColumn")} *!/ */}
      {/*     </button> */}
      {/*   </li> */}
      {/*   <li style={{display: "block"}} id="cwwwwwww"> */}
      {/*     <button id="cwwwwwww" aria-label="Color Picker" title={t("Column.color")} onClick={() => setOpenedColorPicker((o) => !o)}> */}
      {/*       <span className={`column__header-color-option ${color}_selected`} /> */}
      {/*     </button> */}
      {/*     {openedColorPicker && <ColorPicker id={id} name={name} visible={visible} index={index} color={color} onClose={onClose} />} */}
      {/*     <Tooltip className="column__tooltip" anchorSelect="cwwwwwww"> */}
      {/*       hi */}
      {/*     </Tooltip> */}
      {/*   </li> */}
      {/*   <li> */}
      {/*     <button */}
      {/*       aria-label="AddLeftIcon" */}
      {/*       onClick={() => { */}
      {/*         onClose?.(); */}
      {/*         handleAddColumn(index); */}
      {/*       }} */}
      {/*       title={t("Column.addColumnLeft")} */}
      {/*     > */}
      {/*       <ArrowLeft /> */}
      {/*     </button> */}
      {/*   </li> */}
      {/*   <li> */}
      {/*     <button */}
      {/*       aria-label="AddRightIcon" */}
      {/*       onClick={() => { */}
      {/*         onClose?.(); */}
      {/*         handleAddColumn(index + 1); */}
      {/*       }} */}
      {/*       title={t("Column.addColumnRight")} */}
      {/*     > */}
      {/*       <ArrowRight /> */}
      {/*     </button> */}
      {/*   </li> */}
      {/*   <li> */}
      {/*     <button */}
      {/*       aria-label="HideIcon" */}
      {/*       onClick={() => { */}
      {/*         onClose?.(); */}
      {/*         dispatch(Actions.editColumn(id, {name, color, index, visible: !visible})); */}
      {/*       }} */}
      {/*       title={visible ? t("Column.hideColumn") : t("Column.showColumn")} */}
      {/*     > */}
      {/*       {visible ? <Hidden /> : <Visible />} */}
      {/*     </button> */}
      {/*   </li> */}
      {/*   <li> */}
      {/*     <button */}
      {/*       aria-label="EditIcon" */}
      {/*       onClick={() => { */}
      {/*         onNameEdit?.(); */}
      {/*         onClose?.(); */}
      {/*       }} */}
      {/*       title={t("Column.editName")} */}
      {/*     > */}
      {/*       <Edit /> */}
      {/*     </button> */}
      {/*   </li> */}
      {/*   <li> */}
      {/*     <button */}
      {/*       aria-label="CloseIcon" */}
      {/*       title={t("Column.resetName")} */}
      {/*       className="column__header-menu-dropdown-edit-button" */}
      {/*       onClick={() => (setOpenColumnSet ? setOpenColumnSet((o) => !o) : () => {})} */}
      {/*     > */}
      {/*       <Close className="column__header-edit-button-icon" /> */}
      {/*     </button> */}
      {/*   </li> */}
      {/*   <Tooltip className="column__tooltip" anchorSelect="cwwwwwww"> */}
      {/*     hihihi */}
      {/*   </Tooltip> */}
      {/* </ul> */}
    </div>
  );
};
