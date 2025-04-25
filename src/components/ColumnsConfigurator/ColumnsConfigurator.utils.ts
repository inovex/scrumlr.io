import {TemplateColumn} from "store/features";
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
