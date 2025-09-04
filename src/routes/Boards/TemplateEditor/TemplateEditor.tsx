import {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {
  TemplateColumn,
  EditableTemplateColumn,
  Template,
  TemplateWithColumns,
  createTemplateWithColumns,
  TemplateColumnAction,
  editTemplate,
  createTemplateColumn,
  editTemplateColumn,
  deleteTemplateColumn,
} from "store/features";
import {Input} from "components/Input/Input";
import {TextArea} from "components/TextArea/TextArea";
import {ColumnsConfigurator} from "components/ColumnsConfigurator/ColumnsConfigurator";
import {ColumnsMiniView} from "components/ColumnsConfigurator/ColumnsMiniView/ColumnsMiniView"; // for debug purposes
import {ReactComponent as AddIcon} from "assets/icons/plus.svg";
import {ReactComponent as InfoIcon} from "assets/icons/info.svg";
import {DEFAULT_TEMPLATE_ID} from "constants/templates";
import classNames from "classnames";
import {Button} from "components/Button";
import {Outlet, useNavigate, useParams} from "react-router";
import {arrayMove} from "@dnd-kit/sortable";
import {TemplatesNavigationState} from "../Templates";
import "./TemplateEditor.scss";

export type TemplateEditorProps = {mode: "create" | "edit"; debug?: boolean};

// component to edit a template.
// can be either used to edit an existing template (referred by their uuid) or create one from scratch.
// changes will only be saved after clicking the button and are local till then.
export const TemplateEditor = ({mode, debug}: TemplateEditorProps) => {
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
  const basisColumns = useAppSelector((state) => state.templateColumns.filter((tmplCol) => tmplCol.template === templateId))
    // presort by index for DnD
    .sort((a, b) => a.index - b.index);

  // these are to keep track of the template/columns in the editor.
  // they will be initialized using the basis and are editable.
  // the `mode` property will be later used to determine how the backend should handle each column
  const [editableTemplate, setEditableTemplate] = useState<Template>();
  const [editableTemplateColumns, setEditableTemplateColumns] = useState<EditableTemplateColumn[]>();
  // separate to keep track of columns which will be deleted in the future
  const [deleteColumns, setDeleteColumns] = useState<EditableTemplateColumn[]>([]);

  useEffect(() => {
    // safeguard so it only gets set once
    if (basisTemplate && !editableTemplate) {
      setEditableTemplate({...basisTemplate}); // shallow copy
    }
  }, [basisTemplate, editableTemplate]);

  useEffect(() => {
    if (basisColumns && basisColumns.length > 0 && !editableTemplateColumns) {
      setEditableTemplateColumns(basisColumns.map((bc) => ({...bc, persisted: true, mode: undefined})));
    }
  }, [basisColumns, editableTemplateColumns]);

  // states to keep track of changes of the form.
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");

  // all mandatory inputs, i.e. template name and column names must have content (whitespace doesn't count)
  const validForm = !!nameInput.trim() && (editableTemplateColumns?.every((column) => column.name.trim()) ?? true);

  // sets the next mode for a template column, so we later know what to with a column: edit, delete or create
  const nextMode = (action: TemplateColumnAction, currentMode?: TemplateColumnAction): TemplateColumnAction => {
    if (!currentMode) return action;

    // if col is to be created or deleted, editing it doesn't change the fact
    if (action === "edit") return currentMode;
    return action;
  };

  // update index of column. if index changed, also update mode.
  const updateIndex = (column: EditableTemplateColumn, index: number): EditableTemplateColumn =>
    column.index === index
      ? column // no change
      : {...column, index, mode: nextMode("edit", column.mode)}; // update index and mode

  const addColumn = (templateColumn: TemplateColumn, index: number) => {
    if (!editableTemplateColumns) return;

    const updated = editableTemplateColumns
      // add column with status
      .toSpliced(index, 0, {...templateColumn, persisted: false, mode: "create"}) // no nextMode since no previous state exists at this point
      // reset indices
      .map(updateIndex);

    setEditableTemplateColumns(updated);
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    if (!editableTemplateColumns) return;

    const fromColumn = editableTemplateColumns[fromIndex];
    const toColumn = editableTemplateColumns[toIndex];

    fromColumn.mode = nextMode("edit", fromColumn.mode);
    toColumn.mode = nextMode("edit", toColumn.mode);

    const updated = arrayMove(editableTemplateColumns, fromIndex, toIndex).map(updateIndex);

    setEditableTemplateColumns(updated);
  };

  // edit column and mark as edited
  const editColumn = (templateColumn: EditableTemplateColumn, overwrite: Partial<EditableTemplateColumn>) => {
    if (!editableTemplateColumns) return;
    const updated = editableTemplateColumns.map((col) =>
      col.id === templateColumn.id ? ({...col, ...overwrite, mode: nextMode("edit", col.mode)} as EditableTemplateColumn) : col
    );

    setEditableTemplateColumns(updated);
  };

  const deleteColumn = (templateColumn: EditableTemplateColumn) => {
    if (!editableTemplateColumns) return;

    templateColumn.mode = nextMode("delete", templateColumn.mode);
    const updatedColumnsWithoutDeleted = editableTemplateColumns.filter((col) => col.id !== templateColumn.id).map(updateIndex);

    // already persisted columns are added to this state, to be deleted later
    if (templateColumn.persisted) {
      setDeleteColumns((delCols) => [...delCols, templateColumn]);
    }

    setEditableTemplateColumns(updatedColumnsWithoutDeleted);
  };

  const cancelAndGoBack = () => navigate("/boards/templates");

  const saveTemplate = () => {
    if (!editableTemplateColumns || !editableTemplate) return;

    if (mode === "create") {
      // create template based on state
      const newTemplateWithColumns: TemplateWithColumns = {
        template: {
          ...editableTemplate,
          name: nameInput,
          description: descriptionInput,
        },
        columns: editableTemplateColumns,
      };

      // create and go back on success
      dispatch(createTemplateWithColumns(newTemplateWithColumns))
        .unwrap()
        .then(() => navigate("/boards/templates", {state: {scrollToSaved: true} as TemplatesNavigationState}));
    } else if (mode === "edit") {
      // collect which columns to create/edit/delete by comparing to current (store)
      const columnsToBeCreated = editableTemplateColumns.filter((column) => column.mode === "create");
      const columnsToBeEdited = editableTemplateColumns.filter((column) => column.mode === "edit");
      const columnsToBeDeleted = deleteColumns.filter((column) => column.mode === "delete"); // filter shouldn't filter anything out

      const editTemplateDispatch = dispatch(
        editTemplate({
          id: templateId,
          overwrite: {
            name: nameInput,
            description: descriptionInput,
          },
        })
      );

      const createColumnsDispatches = columnsToBeCreated.map((col) => dispatch(createTemplateColumn({templateId, templateColumn: {...col}})));

      const editColumnsDispatches = columnsToBeEdited.map((col) => dispatch(editTemplateColumn({templateId, columnId: col.id, overwrite: {...col}})));

      const deleteColumnsDispatches = columnsToBeDeleted.map((col) => dispatch(deleteTemplateColumn({templateId, columnId: col.id})));

      Promise.all([editTemplateDispatch, ...createColumnsDispatches, ...editColumnsDispatches, ...deleteColumnsDispatches]).then(() => {
        navigate("/boards/templates", {state: {scrollToSaved: true} as TemplatesNavigationState});
      });
    }
  };

  useEffect(() => {
    // after finding the basisTemplate template for editing, set the corresponding form values
    if (id && basisTemplate) {
      setNameInput(basisTemplate.name);
      setDescriptionInput(basisTemplate.description);
    }
  }, [basisTemplate, id]);

  if (!editableTemplate || !editableTemplateColumns) return <div>Error loading template</div>;

  return (
    <>
      <div className="template-editor">
        <section className={classNames("template-editor__header", {"template-editor__header--include-debug": debug})}>
          <div className="template-editor__name">
            <Input
              className="template-editor__name-input"
              type="text"
              input={nameInput}
              setInput={setNameInput}
              height="normal"
              placeholder="Board name"
              required
              dataCy="template-editor__name-input"
            />
          </div>
          <div className="template-editor__description">
            <TextArea
              className="template-editor__description-text-area"
              input={descriptionInput}
              setInput={setDescriptionInput}
              placeholder="Description (optional)"
              border="transparent"
            />
          </div>
          {debug && (
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
                    <tr key={etc.id}>
                      <td>{etc.id}</td>
                      <td>{etc.index}</td>
                      <td>{String(etc.persisted)}</td>
                      <td>{String(etc.mode)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="template-editor__columns">
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
          <div className="template-editor__columns-mini-view-wrapper">
            <ColumnsMiniView className="columns-configurator__mini-view" columns={editableTemplateColumns} />
          </div>
        </section>
        <section className="template-editor__footer">
          <div className="template-editor__info">
            <InfoIcon className="template-editor__info-icon" />
            <div className="template-editor__info-text">{t("Templates.TemplateEditor.info")}</div>
          </div>
          <div className="template-editor__buttons">
            <Button
              className={classNames("template-editor__button", "template-editor__button--return")}
              type="secondary"
              onClick={cancelAndGoBack}
              dataCy="template-editor__button--return"
            >
              {t("Templates.TemplateEditor.cancel")}
            </Button>
            <Button
              className={classNames("template-editor__button", "template-editor__button--create")}
              type="primary"
              icon={<AddIcon />}
              onClick={saveTemplate}
              disabled={!validForm}
              dataCy="template-editor__button--create"
            >
              {t(`Templates.TemplateEditor.save${mode === "create" ? "Create" : "Edit"}`)}
            </Button>
          </div>
        </section>
      </div>
      <Outlet />
    </>
  );
};
