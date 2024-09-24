import "./ColumnsConfigurator.scss";
import classNames from "classnames";
import {useState} from "react";
import {Column} from "types/column";

type ColumnsConfiguratorProps = {
  className?: string;
};

type TemplateColumn = Omit<Column, "index">;

export const ColumnsConfigurator = (props: ColumnsConfiguratorProps) => {
  const initialState: TemplateColumn[] = [
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
  const [columns, setColumns] = useState<TemplateColumn[]>(initialState);

  return <div className={classNames(props.className, "columns-configurator")}>Hello Columns Configurator</div>;
};
