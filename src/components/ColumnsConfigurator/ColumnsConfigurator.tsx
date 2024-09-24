import "./ColumnsConfigurator.scss";
import classNames from "classnames";
import {useState} from "react";
import {Column} from "types/column";
import {closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {arrayMove, horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";
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
  const [templateColumns, setTemplateColumns] = useState<TemplateColumnType[]>(initialState);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    if (active.id !== over?.id) {
      setTemplateColumns((columns) => {
        const oldIndex = columns.findIndex((c) => c.id === active.id);
        const newIndex = columns.findIndex((c) => c.id === over?.id);

        return arrayMove(columns, oldIndex, newIndex);
      });
    }
  };

  const calcPlacement = (index: number) => {
    if (index === 0) {
      return "left";
    }
    if (index === templateColumns.length - 1) {
      return "right";
    }
    return "center";
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={templateColumns} strategy={horizontalListSortingStrategy}>
        <div className={classNames(props.className, "columns-configurator")}>
          {templateColumns.map((column, index) => (
            <TemplateColumn key={column.id} column={column} placement={calcPlacement(index)} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
