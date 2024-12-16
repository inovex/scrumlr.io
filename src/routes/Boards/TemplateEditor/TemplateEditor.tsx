import {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {AccessPolicy, TemplateColumn, EditableTemplateColumn, Template, TemplateWithColumns, createTemplateWithColumns, TemplateColumnAction} from "store/features";
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
import {arrayMove} from "@dnd-kit/sortable";
import {diff} from "deep-object-diff"; // for debug purposes

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

  // these are to keep track of the template/columns in the editor.
  // they will be initialized using the basis and are editable.
  // the `mode` property will be later used to determine how the backend should handle each column
  const [editableTemplate, setEditableTemplate] = useState<Template>();
  const [editableTemplateColumns, setEditableTemplateColumns] = useState<EditableTemplateColumn[]>();
  // TODO add state keeping track of to be deleted columns (maybe not required since in flagged in above array)

  useEffect(() => {
    if (basisTemplate && !editableTemplate) {
      // safeguard so it only gets set once
      console.log("init template to", basisTemplate);
      setEditableTemplate({...basisTemplate}); // shallow copy
    }
  }, [basisTemplate, editableTemplate]);

  useEffect(() => {
    if (basisColumns && !editableTemplateColumns) {
      console.log("init columns to", basisColumns);
      setEditableTemplateColumns(basisColumns.map((bc) => ({...bc, persisted: true, mode: undefined})));
    }
  }, [basisColumns, editableTemplateColumns]);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [activeOptionKey, setActiveOptionKey] = useState<AccessPolicy>("PUBLIC");

  // states to keep track of changes of the form.
  // could be changed to directly refer to the basisTemplate, but that would probably cause a lot of dispatches
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  const nextMode = (action: TemplateColumnAction, currentMode?: TemplateColumnAction): TemplateColumnAction => {
    if (!currentMode) return action;

    switch (action) {
      case "delete":
        return "delete";
      case "create":
        return "create";
      case "edit":
      default:
        // if col is to be created, editing it doesn't change the fact
        return currentMode === "create" ? "create" : "edit";
    }
  };

  // update index of column. if index changed, also update mode.
  const updateIndex = (column: EditableTemplateColumn, index: number): EditableTemplateColumn =>
    column.index === index
      ? column // no change
      : {...column, index, mode: nextMode("edit", column.mode)}; // update index and mode

  const addColumn = (templateColumn: TemplateColumn, index: number) => {
    // dispatch(addTemplateColumnOptimistically({templateColumn, index}));
    if (!editableTemplateColumns) return;

    const updated = editableTemplateColumns
      // add column with status
      .toSpliced(index, 0, {...templateColumn, persisted: false, mode: "create"}) // no nextMode since no previous state exists at this point
      // reset indices
      .map(updateIndex);

    console.log("add column", diff(editableTemplateColumns, updated));
    setEditableTemplateColumns(updated);
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    // dispatch(moveTemplateColumnOptimistically({templateId, fromIndex, toIndex}));
    if (!editableTemplateColumns) return;

    const fromColumn = editableTemplateColumns[fromIndex];
    const toColumn = editableTemplateColumns[toIndex];

    // TODO change using setter func instead of direct access?
    fromColumn.mode = nextMode("edit", fromColumn.mode);
    toColumn.mode = nextMode("edit", toColumn.mode);

    const updated = arrayMove(editableTemplateColumns, fromIndex, toIndex).map(updateIndex);

    console.log("move column", diff(editableTemplateColumns, updated));
    setEditableTemplateColumns(updated);
  };

  // edit column and mark as edited
  const editColumn = (templateColumn: EditableTemplateColumn, overwrite: Partial<EditableTemplateColumn>) => {
    // dispatch(editTemplateColumnOptimistically({columnId: templateColumn.id, overwrite}));
    if (!editableTemplateColumns) return;
    const updated = editableTemplateColumns.map((col) =>
      col.id === templateColumn.id ? ({...col, ...overwrite, mode: nextMode("edit", col.mode)} as EditableTemplateColumn) : col
    );

    console.log("edit column", diff(editableTemplateColumns, updated));
    setEditableTemplateColumns(updated);
  };

  const deleteColumn = (templateColumn: EditableTemplateColumn) => {
    // dispatch(deleteTemplateColumnOptimistically({columnId: templateColumn.id}));
    if (!editableTemplateColumns) return;

    let updated: EditableTemplateColumn[];
    if (templateColumn.persisted) {
      // only mark as deleted
      // TODO how are indices handled if we filter these out visually but still remain in array?
      templateColumn.mode = nextMode("delete", templateColumn.mode);
      updated = editableTemplateColumns.map((col) => (col.id === templateColumn.id ? templateColumn : col)); // may be not required since it's already part of array
      console.log("flag as deleted", updated);
    } else {
      // actually delete
      updated = editableTemplateColumns.map((col) => (col.id !== templateColumn.id ? col : null)).filter((col) => col !== null);
    }

    console.log("delete column", diff(editableTemplateColumns, updated));
    setEditableTemplateColumns(updated);
  };

  const cancelAndGoBack = () => navigate("/boards/templates");

  // TODO revise
  const saveTemplate = () => {
    // throw new Error("save not implemented yet");
    if (!editableTemplateColumns || !editableTemplate) return;

    if (mode === "create") {
      // create template based on state
      const newTemplateWithColumns: TemplateWithColumns = {
        template: {
          ...editableTemplate,
          name: nameInput,
          description: descriptionInput,
          accessPolicy: activeOptionKey,
        },
        columns: editableTemplateColumns,
      };

      // create and go back on success
      dispatch(createTemplateWithColumns(newTemplateWithColumns))
        .unwrap()
        .then(() => navigate("/boards/templates"));
    } else if (mode === "edit") {
      // collect which columns to create/edit/delete by comparing to current (store)
    }
    /* if (!basisTemplate || !basisColumns) return;
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
    } */
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

  if (!editableTemplate || !editableTemplateColumns) return <div>Error loading template</div>;

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
      <div className="template-editor__debug">
        <table>
          <thead>
            <tr>
              <th>Column</th>
              <th>Index</th>
              <th>Persisted</th>
              <th>Mode</th>
            </tr>
          </thead>
          <tbody>
            {editableTemplateColumns.map((etc) => (
              <tr>
                <td>{etc.id}</td>
                <td>{etc.index}</td>
                <td>{String(etc.persisted)}</td>
                <td>{String(etc.mode)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="template-editor__columns-configurator-wrapper">
        <ColumnsConfigurator
          className="template-editor__columns-configurator"
          templateId={templateId}
          columns={editableTemplateColumns}
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
