import "./ColumnsConfigurator.scss";
import classNames from "classnames";

type ColumnsConfiguratorProps = {
  className?: string;
};

export const ColumnsConfigurator = (props: ColumnsConfiguratorProps) => <div className={classNames(props.className, "columns-configurator")}>Hello Columns Configurator</div>;
