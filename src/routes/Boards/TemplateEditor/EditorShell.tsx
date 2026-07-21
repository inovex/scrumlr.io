import {ReactNode, useState} from "react";
import {useTranslation} from "react-i18next";
import classNames from "classnames";
import {EditableTemplateColumn, TemplateColumn, TemplateColumnAction} from "store/features";
import {Input} from "components/Input/Input";
import {TextArea} from "components/TextArea/TextArea";
import {ColumnsConfigurator} from "components/ColumnsConfigurator/ColumnsConfigurator";
import {ColumnsMiniView} from "components/ColumnsConfigurator/ColumnsMiniView/ColumnsMiniView"; // for debug purposes
import {InfoIcon} from "components/Icon";
import {Button} from "components/Button";
import {arrayMove} from "@dnd-kit/sortable";
import "./TemplateEditor.scss";

export type EditorSubmitPayload = {
  name: string;
  description: string;
  columns: EditableTemplateColumn[];
  deletedColumns: EditableTemplateColumn[];
};

// shared editor used to create/edit a template or a board (from history).
// owns the editable form state only
export type EditorShellProps = {
  editorId: string; // forwarded to ColumnsConfigurator as templateId (a template id or a board id)
  initialName: string;
  initialDescription: string;
  initialColumns: EditableTemplateColumn[];
  submitLabel: string;
  submitIcon: ReactNode;
  onSubmit: (payload: EditorSubmitPayload) => void;
  onCancel: () => void;
  debug?: boolean;
};

export const EditorShell = ({editorId, initialName, initialDescription, initialColumns, submitLabel, submitIcon, onSubmit, onCancel, debug}: EditorShellProps) => {
  const {t} = useTranslation();

  const [nameInput, setNameInput] = useState(initialName);
  const [descriptionInput, setDescriptionInput] = useState(initialDescription);
  const [editableColumns, setEditableColumns] = useState<EditableTemplateColumn[]>(initialColumns);
  // separate to keep track of columns which will be deleted in the future
  const [deleteColumns, setDeleteColumns] = useState<EditableTemplateColumn[]>([]);

  // all mandatory inputs, i.e. board/template name and column names must have content (whitespace doesn't count)
  const validForm = !!nameInput.trim() && editableColumns.every((column) => column.name.trim());

  // sets the next mode for a column, so we later know what to do with a column: edit, delete or create
  const nextMode = (action: TemplateColumnAction, currentMode?: TemplateColumnAction): TemplateColumnAction => {
    if (!currentMode) return action;

    // if col is to be created or deleted, editing it doesn't change the fact
    if (action === "edit") return currentMode;
    return action;
  };

  // update index of column. if index changed, also update mode.
  const updateIndex = (column: EditableTemplateColumn, index: number): EditableTemplateColumn =>
    column.index === index ? column : {...column, index, mode: nextMode("edit", column.mode)};

  const addColumn = (templateColumn: TemplateColumn, index: number) => {
    const updated = editableColumns.toSpliced(index, 0, {...templateColumn, persisted: false, mode: "create"}).map(updateIndex);
    setEditableColumns(updated);
  };

  const moveColumn = (fromIndex: number, toIndex: number) => {
    const fromColumn = editableColumns[fromIndex];
    const toColumn = editableColumns[toIndex];

    fromColumn.mode = nextMode("edit", fromColumn.mode);
    toColumn.mode = nextMode("edit", toColumn.mode);

    const updated = arrayMove(editableColumns, fromIndex, toIndex).map(updateIndex);
    setEditableColumns(updated);
  };

  // edit column and mark as edited
  const editColumn = (templateColumn: EditableTemplateColumn, overwrite: Partial<EditableTemplateColumn>) => {
    const updated = editableColumns.map((col) => (col.id === templateColumn.id ? ({...col, ...overwrite, mode: nextMode("edit", col.mode)} as EditableTemplateColumn) : col));
    setEditableColumns(updated);
  };

  const deleteColumn = (templateColumn: EditableTemplateColumn) => {
    templateColumn.mode = nextMode("delete", templateColumn.mode);
    const updatedColumnsWithoutDeleted = editableColumns.filter((col) => col.id !== templateColumn.id).map(updateIndex);

    // already persisted columns are added to this state, to be deleted later
    if (templateColumn.persisted) {
      setDeleteColumns((delCols) => [...delCols, templateColumn]);
    }

    setEditableColumns(updatedColumnsWithoutDeleted);
  };

  const handleSubmit = () => onSubmit({name: nameInput, description: descriptionInput, columns: editableColumns, deletedColumns: deleteColumns});

  return (
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
                {editableColumns.map((etc) => (
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
            templateId={editorId}
            columns={editableColumns}
            addColumn={addColumn}
            moveColumn={moveColumn}
            editColumn={editColumn}
            deleteColumn={deleteColumn}
          />
        </div>
        <div className="template-editor__columns-mini-view-wrapper">
          <ColumnsMiniView className="columns-configurator__mini-view" columns={editableColumns} />
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
            variant="secondary"
            onClick={onCancel}
            testId="template-editor__button--return"
          >
            {t("Templates.TemplateEditor.cancel")}
          </Button>
          <Button
            className={classNames("template-editor__button", "template-editor__button--create")}
            variant="primary"
            icon={submitIcon}
            onClick={handleSubmit}
            disabled={!validForm}
            testId="template-editor__button--create"
          >
            {submitLabel}
          </Button>
        </div>
      </section>
    </div>
  );
};
