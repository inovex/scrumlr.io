import classNames from "classnames";
import {useState} from "react";
import {Column} from "types/column";
import {closestCenter, DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {arrayMove, horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import {TemplateColumn} from "./TemplateColumn/TemplateColumn";
import "./ColumnsConfigurator.scss";

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

  // id of column which is actively being dragged
  const [dragElementId, setDragElementId] = useState<string | null>(null);
  const [dropElemenId, setDropElementId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    setDragElementId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setDropElementId((event.over?.id as string) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;

    if (active.id !== over?.id) {
      setTemplateColumns((columns) => {
        const oldIndex = columns.findIndex((c) => c.id === active.id);
        const newIndex = columns.findIndex((c) => c.id === over?.id);

        return arrayMove(columns, oldIndex, newIndex);
      });
    }

    // don't forget to clear states
    setDragElementId(null);
    setDropElementId(null);
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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <SortableContext items={templateColumns} strategy={horizontalListSortingStrategy}>
        <div className={classNames(props.className, "columns-configurator")}>
          {templateColumns.map((column, index) => (
            <TemplateColumn
              className="columns-configurator__column"
              key={column.id}
              column={column}
              activeDrag={column.id === dragElementId}
              activeDrop={column.id === dropElemenId}
              placement={calcPlacement(index)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
