import {Component} from "react";
import {Column} from "../../../../types/column";

export type ExportHintHiddenColumnsProps = {
  columns: Column[];
};

export class ExportHintHiddenColumns extends Component<ExportHintHiddenColumnsProps> {
  hiddenColumns = this.props.columns.filter((col) => !col.visible);

  render() {
    if (this.hiddenColumns.length > 0) {
      return (
        <div>
          <p>Warning: You have hidden columns which will not be exported.</p>
          <p>Columns:</p>
          <ul>
            {this.hiddenColumns.map((hiddenCol) => (
              <li>{hiddenCol.name}</li>
            ))}
          </ul>
        </div>
      );
    } 
      return null;
    
  }
}
