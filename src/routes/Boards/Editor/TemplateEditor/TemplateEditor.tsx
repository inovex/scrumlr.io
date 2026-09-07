import {useEffect, useState} from "react";
import {isEqual} from "underscore";
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
  getBoards,
} from "store/features";
import {PlusIcon} from "components/Icon";
import {LoadingScreen} from "components/LoadingScreen";
import {DEFAULT_TEMPLATE_ID} from "constants/templates";
import {Outlet, useNavigate, useParams} from "react-router";
import {EditorShell, EditorSubmitPayload} from "routes/Boards/Editor";
import {TemplatesNavigationState} from "routes/Boards/Templates";

export type TemplateEditorProps = {mode: "create" | "edit" | "createFromBoard"; debug?: boolean};

// component to edit or create a template.
// can be used to edit an existing template (referred by their uuid), create one from scratch,
// or create one pre-filled from an existing board (referred by their boardId).
// changes will only be saved after clicking the button and are local till then.
export const TemplateEditor = ({mode, debug}: TemplateEditorProps) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // id is set in /edit-template/:id route, boardId in /create-template/:boardId route (neither validated here)
  const {id, boardId} = useParams();

  const templateId = id ?? DEFAULT_TEMPLATE_ID;

  // template which serves as basis, either from given id or default fallback.
  const basisTemplate = useAppSelector((state) => state.templates.find((tmpl) => tmpl.id === templateId));
  // template columns are displayed in order of their index.
  const basisColumns = useAppSelector((state) => state.templateColumns.filter((tmplCol) => tmplCol.template === templateId).toSorted((a, b) => a.index - b.index), isEqual);

  // when creating from an existing board, its name/description/columns seed the editor.
  const historyLoaded = useAppSelector((state) => state.history.length > 0);
  const board = useAppSelector((state) => state.history.find((b) => b.id === boardId));
  // `attempted` tracks whether we've finished trying to load the history, so an empty history doesn't spin forever.
  const [attempted, setAttempted] = useState(false);

  // when deep-linked/refreshed straight into create-from-board, the History page never ran the fetch, so load it here.
  useEffect(() => {
    if (mode !== "createFromBoard" || historyLoaded) {
      setAttempted(true);
      return;
    }
    dispatch(getBoards()).finally(() => setAttempted(true));
  }, [dispatch, mode, historyLoaded]);

  const cancelAndGoBack = () => navigate("/boards/templates");

  const saveTemplate = (payload: EditorSubmitPayload) => {
    if (mode === "create" || mode === "createFromBoard") {
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

  if (mode === "createFromBoard") {
    if (!attempted && !board) return <LoadingScreen />;
    if (!basisTemplate || !board) return <div>Error loading template</div>;
  } else if (!basisTemplate || basisColumns.length === 0) {
    return <div>Error loading template</div>;
  }

  // seed columns from the board (create-from-board) or from the basis template (create/edit).
  const initialColumns: EditableTemplateColumn[] =
    mode === "createFromBoard"
      ? [...board!.columns].sort((a, b) => a.index - b.index).map((column) => ({...column, template: templateId, persisted: true, mode: undefined}))
      : basisColumns.map((bc) => ({...bc, persisted: true, mode: undefined}));

  const initialName = mode === "createFromBoard" ? board!.name : id ? basisTemplate!.name : "";
  const initialDescription = mode === "createFromBoard" ? board!.description : id ? basisTemplate!.description : "";

  return (
    <>
      <EditorShell
        editorId={templateId}
        initialName={initialName}
        initialDescription={initialDescription}
        initialColumns={initialColumns}
        submitLabel={t(`Templates.TemplateEditor.save${mode === "edit" ? "Edit" : "Create"}`)}
        submitIcon={<PlusIcon />}
        onSubmit={saveTemplate}
        onCancel={cancelAndGoBack}
        debug={debug}
      />
      <Outlet />
    </>
  );
};
