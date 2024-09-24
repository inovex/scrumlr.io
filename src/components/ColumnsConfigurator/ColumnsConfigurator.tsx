import "./ColumnsConfigurator.scss";
import classNames from "classnames";
import {useState} from "react";
import {Column} from "types/column";
import {TemplateColumn} from "./TemplateColumn/TemplateColumn";

type ColumnsConfiguratorProps = {
  className?: string;
};

export type TemplateColumnType = Omit<Column, "index">;

export const ColumnsConfigurator = (props: ColumnsConfiguratorProps) => {
  const initialState: TemplateColumnType[] = [
    {
      id: "col1",
      color: "backlog-blue",
      name: "Column 1",
      visible: true,
    },
    {
      id: "col2",
      color: "planning-pink",
      name: "Column 2",
      visible: true,
    },
    {
      id: "col3",
      color: "value-violet",
      name: "Column3",
      visible: false,
    },
  ];
  const [columns, _setColumns] = useState<TemplateColumnType[]>(initialState);

  return (
    <div className={classNames(props.className, "columns-configurator")}>
      {columns.map((column) => (
        <TemplateColumn key={column.id} column={column} />
      ))}
    </div>
  );
};
