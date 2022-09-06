import {Component} from "react";

export class ExportHintHiddenColumns extends Component {
  render() {
    return (
      <div>
        Warning: You have hidden columns which will not be exported. Columns:
        <ul>
          <li>col1</li>
          <li>col2</li>
          <li>col3</li>
        </ul>
      </div>
    );
  }
}
