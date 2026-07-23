import {useAppDispatch, useAppSelector} from "store";
import {useTranslation} from "react-i18next";
import {
  EditableTemplateColumn,
  TemplateWithColumns,
  createTemplateWithColumns,
  editTemplate,
  createTemplateColumn,
  editTemplateColumn,
  deleteTemplateColumn,
} from "store/features";
import {PlusIcon} from "components/Icon";
import {DEFAULT_TEMPLATE_ID} from "constants/templates";
import {Outlet, useNavigate, useParams} from "react-router";
import {TemplatesNavigationState} from "../Templates";
import {EditorShell, EditorSubmitPayload} from "./EditorShell";

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
  // template columns are displayed in order of their index.
  const basisColumns = useAppSelector((state) => state.templateColumns.filter((tmplCol) => tmplCol.template === templateId)).sort((a, b) => a.index - b.index);

  const cancelAndGoBack = () => navigate("/boards/templates");

  const saveTemplate = (payload: EditorSubmitPayload) => {
    if (mode === "create") {
      // create template based on the editor state
      const newTemplateWithColumns: TemplateWithColumns = {
        template: {...basisTemplate!, name: payload.name, description: payload.description},
        columns: payload.columns,
      };

      // create and go back on success
      dispatch(createTemplateWithColumns(newTemplateWithColumns))
        .unwrap()
        .then(() => navigate("/boards/templates", {state: {scrollToSaved: true} as TemplatesNavigationState}));
    } else if (mode === "edit") {
      // collect which columns to create/edit/delete by comparing to current (store)
      const columnsToBeCreated = payload.columns.filter((column) => column.mode === "create");
      const columnsToBeEdited = payload.columns.filter((column) => column.mode === "edit");
      const columnsToBeDeleted = payload.deletedColumns.filter((column) => column.mode === "delete"); // filter shouldn't filter anything out

      const editTemplateDispatch = dispatch(editTemplate({id: templateId, overwrite: {name: payload.name, description: payload.description}}));
      const createColumnsDispatches = columnsToBeCreated.map((col) => dispatch(createTemplateColumn({templateId, templateColumn: {...col}})));
      const editColumnsDispatches = columnsToBeEdited.map((col) => dispatch(editTemplateColumn({templateId, columnId: col.id, overwrite: {...col}})));
      const deleteColumnsDispatches = columnsToBeDeleted.map((col) => dispatch(deleteTemplateColumn({templateId, columnId: col.id})));

      Promise.all([editTemplateDispatch, ...createColumnsDispatches, ...editColumnsDispatches, ...deleteColumnsDispatches]).then(() => {
        navigate("/boards/templates", {state: {scrollToSaved: true} as TemplatesNavigationState});
      });
    }
  };

  if (!basisTemplate || basisColumns.length === 0) return <div>Error loading template</div>;

  const initialColumns: EditableTemplateColumn[] = basisColumns.map((bc) => ({...bc, persisted: true, mode: undefined}));

  return (
    <>
      <EditorShell
        editorId={templateId}
        initialName={id ? basisTemplate.name : ""}
        initialDescription={id ? basisTemplate.description : ""}
        initialColumns={initialColumns}
        submitLabel={t(`Templates.TemplateEditor.save${mode === "create" ? "Create" : "Edit"}`)}
        submitIcon={<PlusIcon />}
        onSubmit={saveTemplate}
        onCancel={cancelAndGoBack}
        debug={debug}
      />
      <Outlet />
    </>
  );
};
