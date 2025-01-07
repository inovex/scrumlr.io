import {uniqueId} from "underscore";
import classNames from "classnames";
import {useState} from "react";
import {EditableTemplateColumn, TemplateColumn} from "store/features";
import {Color, getColorClassName, getNextColor, getPreviousColor} from "constants/colors";
import {closestCenter, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import {ColumnsConfiguratorColumn} from "./ColumnsConfiguratorColumn/ColumnsConfiguratorColumn";
import {AddTemplateColumn} from "./AddTemplateColumn/AddTemplateColumn";
import "./ColumnsConfigurator.scss";

type ColumnsConfiguratorProps = {
  className: string;
  templateId: string;
  columns: EditableTemplateColumn[]; // without deleted cols
  addColumn: (templateColumn: TemplateColumn, index: number) => void;
  moveColumn: (fromIndex: number, toIndex: number) => void;
  editColumn: (templateColumn: EditableTemplateColumn, overwrite: Partial<EditableTemplateColumn>) => void;
  deleteColumn: (templateColumn: EditableTemplateColumn) => void;
};

export const ColumnsConfigurator = (props: ColumnsConfiguratorProps) => {
  // id of column which is actively being dragged
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<EditableTemplateColumn | null>(null);
  const [dropElementId, setDropElementId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string;
    setActiveElementId(activeId);
    setActiveColumn(props.columns.find((c) => c.id === activeId)!);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setDropElementId((event.over?.id as string) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;

    if (active.id !== over?.id) {
      const oldIndex = props.columns.findIndex((c) => c.id === active.id);
      const newIndex = props.columns.findIndex((c) => c.id === over?.id);

      props.moveColumn(oldIndex, newIndex);
    }

    // don't forget to clear states
    setActiveElementId(null);
    setActiveColumn(null);
    setDropElementId(null);
  };

  const calcPlacement = (index: number) => {
    if (index === 0) {
      return "first";
    }
    if (index === props.columns.length - 1) {
      return "last";
    }
    return "center";
  };

  // function to calculate where each column would be positioned if the drag-and-drop operation were completed at its current state
  const getPotentialIndex = (index: number) => {
    // no valid drag operation occurring
    if (!activeElementId || !dropElementId) return index;

    const dragElementIndex = props.columns.findIndex((c) => c.id === activeElementId);
    const dropElementIndex = props.columns.findIndex((c) => c.id === dropElementId);

    // if current index matches active index of drag element, the column is being dragged there,
    // so the potential index is that of the drop element
    if (index === dragElementIndex) {
      return dropElementIndex;
    }

    // dragging right: active index less the drop zone, and element is between them, the element shifts to the left
    if (dragElementIndex < dropElementIndex && index > dragElementIndex && index <= dropElementIndex) {
      return index - 1;
    }

    // dragging left: analogue to above, element shifts to the right
    if (dragElementIndex > dropElementIndex && index < dragElementIndex && index >= dropElementIndex) {
      return index + 1;
    }

    // otherwise the index remains unchanged
    return index;
  };

  // renders the drag overlay, which is the element which is dragged
  const renderDragOverlay = () => {
    if (!activeElementId || !activeColumn) return null;
    const activeColumnIndex = getPotentialIndex(props.columns.findIndex((c) => c.id === activeColumn.id));

    return (
      <ColumnsConfiguratorColumn
        className={classNames("columns-configurator__column", "columns-configurator__column--ghost")}
        column={activeColumn}
        // here, use actual index unlike potential index in the main part
        index={activeColumnIndex}
        placement={calcPlacement(activeColumnIndex)}
        allColumns={props.columns}
      />
    );
  };

  const addTemplateColumn = (alignment: "left" | "right", color: Color) => {
    const newColumn: TemplateColumn = {
      id: uniqueId("col"),
      template: props.templateId,
      name: "Column",
      description: "",
      color,
      visible: false,
      index: -1, // will be overwritten anyway
    };

    // target index for the right has to take deleted cols which are still part of the array into account,
    // which is why we use the total col amount as new index
    const index = alignment === "left" ? 0 : props.columns.length;

    // TODO can illegal indices happen? apparently so

    props.addColumn(newColumn, index);
  };

  if (props.columns.length === 0) {
    return null;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <SortableContext items={props.columns} strategy={horizontalListSortingStrategy}>
        <div className={classNames(props.className, "columns-configurator", getColorClassName("backlog-blue"))}>
          <AddTemplateColumn alignment="left" color={getPreviousColor(props.columns[0].color)} onClick={addTemplateColumn} />
          <div className="columns-configurator__columns-wrapper">
            {props.columns.map((column, index) => {
              const potentialIndex = getPotentialIndex(index);
              return (
                <ColumnsConfiguratorColumn
                  className="columns-configurator__column"
                  key={column.id}
                  column={column}
                  index={potentialIndex}
                  activeDrag={column.id === activeElementId}
                  activeDrop={column.id === dropElementId}
                  placement={calcPlacement(potentialIndex)}
                  allColumns={props.columns}
                  editColumn={props.editColumn}
                  deleteColumn={props.deleteColumn}
                />
              );
            })}
          </div>
          <AddTemplateColumn alignment="right" color={getNextColor(props.columns[props.columns.length - 1].color)} onClick={addTemplateColumn} />
        </div>
      </SortableContext>

      <DragOverlay>{renderDragOverlay()}</DragOverlay>
    </DndContext>
  );
};
