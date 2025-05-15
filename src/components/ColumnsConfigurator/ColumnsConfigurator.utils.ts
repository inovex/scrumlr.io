import {EditableTemplateColumn, ExistenceStatus, Template, TemplateColumn, TemplateWithColumns} from "store/features";
import {ColumnPlacement} from "./ColumnsConfigurator.types";

export const calcPlacement = (index: number, columns: TemplateColumn[]): ColumnPlacement => {
  const {length} = columns;
  if (length === 1) {
    return "all";
  }
  if (index === 0) {
    return "first";
  }
  if (index === length - 1) {
    return "last";
  }
  return "center";
};

// convert TemplateColumn to EditableColumn, used for test purposes
export const convertToEditableColumn = (c: TemplateColumn, overrideExistenceStatus?: Partial<ExistenceStatus>): EditableTemplateColumn =>
  ({
    ...c,
    persisted: false,
    mode: undefined,
    ...overrideExistenceStatus,
  }) as EditableTemplateColumn;

// from an array of all templates and column, create a TemplateAndColumns array with all corresponding pairs
export const mergeTemplateAndColumns = (templates: Template[], templateColumns: TemplateColumn[]) =>
  templates.map((template) => ({
    template,
    columns: templateColumns.filter((column) => column.template === template.id),
  })) as TemplateWithColumns[];

export const getTemplateAndColumnsByTemplateId = (templatesAndColumns: {templates: Template[]; templateColumns: TemplateColumn[]}, templateId: string) =>
  mergeTemplateAndColumns(templatesAndColumns.templates, templatesAndColumns.templateColumns).find((tac) => tac.template.id === templateId);
