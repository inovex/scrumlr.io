import {EditableTemplateColumn, ExistenceStatus, TemplateColumn} from "store/features";
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
