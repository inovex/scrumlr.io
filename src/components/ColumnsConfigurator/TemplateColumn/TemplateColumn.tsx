import "./TemplateColumn.scss";
import {TemplateColumnType} from "../ColumnsConfigurator";

type TemplateColumnProps = {
  column: TemplateColumnType;
};

export const TemplateColumn = ({column}: TemplateColumnProps) => <div className="template-column">{column.id}</div>;
