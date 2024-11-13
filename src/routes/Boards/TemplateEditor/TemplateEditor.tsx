import {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {
  AccessPolicy,
  addTemplateColumnOptimistically,
  createTemplateWithColumns,
  editTemplate,
  moveTemplateColumnOptimistically,
  createTemplateColumn,
  editTemplateColumn,
  TemplateColumn,
  TemplateWithColumns,
  deleteTemplateColumn,
  editTemplateColumnOptimistically,
  deleteTemplateColumnOptimistically,
} from "store/features";
import {Dropdown} from "components/Dropdown/Dropdown";
import {Input} from "components/Input/Input";
import {TextArea} from "components/TextArea/TextArea";
import {ColumnsConfigurator} from "components/ColumnsConfigurator/ColumnsConfigurator";
import {ReactComponent as GlobeIcon} from "assets/icons/open.svg";
import {ReactComponent as KeyIcon} from "assets/icons/key-protected.svg";
import {ReactComponent as LockIcon} from "assets/icons/lock-closed.svg";
import {ReactComponent as ShuffleIcon} from "assets/icons/shuffle.svg";
import {ReactComponent as InfoIcon} from "assets/icons/info.svg";
import {ReactComponent as AddIcon} from "assets/icons/plus.svg";
import {DEFAULT_TEMPLATE_ID} from "constants/templates";
import classNames from "classnames";
import {Button} from "components/Button";
import {useNavigate, useParams} from "react-router";
import "./TemplateEditor.scss";

// todo maybe just change the translation keys to AccessPolicy => lowercase
const getAccessPolicyTranslationKey = (policy: AccessPolicy) => {
  switch (policy) {
    case "PUBLIC":
      return "open";
    case "BY_PASSPHRASE":
      return "password";
    default:
      return "approval";
  }
};

type TemplateColumnProps = {mode: "create" | "edit"};

// component to edit a template.
// can be either used to edit an existing template (referred by their uuid) or create one from scratch.
// changes will only be saved after clicking the button and are local till then.
export const TemplateEditor = ({mode}: TemplateColumnProps) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // id is set in /edit/:id route (not checked whether its valid though)
  const {id} = useParams();

  const templateId = id ?? DEFAULT_TEMPLATE_ID;

  // template which serves as basis, either from given id or default fallback.
  const basisTemplate = useAppSelector((state) => state.templates.find((tmpl) => tmpl.id === templateId));
  // no columns found? use from default template. keep in mind this is also true if template is valid, but the array is empty! logic to avoid empty array has to be checked
  // template columns are displayed in order of their index.
  const basisColumns = useAppSelector((state) => state.templatesColumns.filter((tmplCol) => tmplCol.template === templateId))
    // remove columns that are flagged to be deleted TODO maybe irrelevant?
    // .filter((c) => !c.deleteFlag)
    // presort by index for DnD
    .sort((a, b) => a.index - b.index);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [activeOptionKey, setActiveOptionKey] = useState<AccessPolicy>("PUBLIC");

  // states to keep track of changes of the form.
  // could be changed to directly refer to the basisTemplate, but that would probably cause a lot of dispatches
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  const addColumn = (templateColumn: TemplateColumn, index: number) => {
    dispatch(addTemplateColumnOptimistically({templateColumn, index}));
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    dispatch(moveTemplateColumnOptimistically({templateId, fromIndex, toIndex}));
  };

  const editColumn = (templateColumn: TemplateColumn, overwrite: Partial<TemplateColumn>) => {
    dispatch(editTemplateColumnOptimistically({columnId: templateColumn.id, overwrite}));
  };

  const deleteColumn = (templateColumn: TemplateColumn) => {
    dispatch(deleteTemplateColumnOptimistically({columnId: templateColumn.id}));
  };

  const cancelAndGoBack = () => navigate("/boards/templates");

  const saveTemplate = () => {
    if (!basisTemplate || !basisColumns) return;
    if (mode === "create") {
      // overwrite from form
      const newTemplateWithColumns: TemplateWithColumns = {
        template: {
          ...basisTemplate,
          name: nameInput,
          description: descriptionInput,
          accessPolicy: activeOptionKey,
        },
        columns: basisColumns,
      };
      // create and go back on success
      dispatch(createTemplateWithColumns(newTemplateWithColumns))
        .unwrap()
        .then(() => navigate("/boards/templates"));
    } else {
      // edit => update existing columns, create missing columns
      const editTemplateDispatch = dispatch(
        editTemplate({
          id: basisTemplate.id,
          overwrite: {
            name: nameInput,
            description: descriptionInput,
            accessPolicy: activeOptionKey,
          },
        })
      );

      const columnsToEditDispatches = basisColumns
        .filter((tmplCol) => !tmplCol.temporaryFlag && !tmplCol.toBeDeletedFlag)
        .map((ce) => dispatch(editTemplateColumn({templateId, columnId: ce.id, overwrite: ce})));
      const columnsToCreateDispatches = basisColumns
        .filter((tmplCol) => tmplCol.temporaryFlag && !tmplCol.toBeDeletedFlag)
        .map((cc) => dispatch(createTemplateColumn({templateId, templateColumn: cc})));
      const columnsToDeleteDispatches = basisColumns
        .filter((tmplCol) => tmplCol.toBeDeletedFlag && !tmplCol.temporaryFlag)
        .map((cd) => dispatch(deleteTemplateColumn({templateId, columnId: cd.id})));

      Promise.all([editTemplateDispatch, ...columnsToEditDispatches, ...columnsToCreateDispatches, ...columnsToDeleteDispatches])
        .then(() => navigate("/boards/templates"))
        .catch((e) => {
          throw new Error("Error while editing template", e);
        });
    }
  };

  useEffect(() => {
    // after finding the basisTemplate template for editing, set the corresponding form values
    if (id && basisTemplate) {
      setActiveOptionKey(basisTemplate.accessPolicy);
      setNameInput(basisTemplate.name);
      setDescriptionInput(basisTemplate.description);
    }
    // todo handle error if id ends up not referring to an actual template
  }, [basisTemplate, id]);

  const toggleDropDown = () => setOpenDropdown((curr) => !curr);
  const selectDropdownOption = (key: AccessPolicy) => {
    setActiveOptionKey(key);
    setOpenDropdown(false);
  };

  return (
    <div className="template-editor">
      <Dropdown<AccessPolicy>
        className="template-editor__dropdown"
        open={openDropdown}
        options={[
          {key: "PUBLIC", label: t(`CreateBoard.dropdown.${getAccessPolicyTranslationKey("PUBLIC")}`), icon: <GlobeIcon />},
          {key: "BY_PASSPHRASE", label: t(`CreateBoard.dropdown.${getAccessPolicyTranslationKey("BY_PASSPHRASE")}`), icon: <KeyIcon />},
          {key: "BY_INVITE", label: t(`CreateBoard.dropdown.${getAccessPolicyTranslationKey("BY_INVITE")}`), icon: <LockIcon />},
        ]}
        activeKey={activeOptionKey}
        onToggleMenu={toggleDropDown}
        onSelect={selectDropdownOption}
      />

      {activeOptionKey === "BY_PASSPHRASE" && (
        <div className="template-editor__password-wrapper">
          <ShuffleIcon className="template-editor__shuffle-icon" />
          <Input className="template-editor__password-wrapper" type="password" height="normal" input={passwordInput} setInput={setPasswordInput} placeholder="Password" />
        </div>
      )}

      <div className="template-editor__info">
        <InfoIcon className="template-editor__info-icon" />
        <div className="template-editor__info-text">{t(`CreateBoard.info.${getAccessPolicyTranslationKey(activeOptionKey)}`)}</div>
      </div>
      <div className="template-editor__name">
        <Input type="text" input={nameInput} setInput={setNameInput} height="normal" placeholder="Board name" />
      </div>
      <div className="template-editor__description">
        <TextArea className="template-editor__description-text-area" input={descriptionInput} setInput={setDescriptionInput} placeholder="Description (optional)" />
      </div>
      <div className="template-editor__columns-configurator-wrapper">
        <ColumnsConfigurator
          className="template-editor__columns-configurator"
          templateId={templateId}
          columns={basisColumns}
          addColumn={addColumn}
          moveColumn={moveColumn}
          editColumn={editColumn}
          deleteColumn={deleteColumn}
        />
      </div>
      <div className="template-editor__buttons">
        <Button className={classNames("template-editor__button", "template-editor__button--return")} type="secondary" onClick={cancelAndGoBack}>
          {t("Templates.TemplateEditor.cancel")}
        </Button>
        <Button className={classNames("template-editor__button", "template-editor__button--create")} type="primary" icon={<AddIcon />} onClick={saveTemplate}>
          {t("Templates.TemplateEditor.save")}
        </Button>
      </div>
    </div>
  );
};
