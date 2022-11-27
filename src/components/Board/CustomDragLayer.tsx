import {Note} from "components/Note";
import {useEffect, useState} from "react";
import {DragLayerMonitor, useDragLayer} from "react-dnd";
import {useAppSelector} from "store";
import "./CustomDragLayer.scss";

const CustomDragLayer = () => {
  const [size, setSize] = useState({width: 0, height: 0});
  const viewer = useAppSelector((state) => state.participants!.self);

  const {isDragging, currentOffset, item} = useDragLayer((monitor: DragLayerMonitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  const handleResize = () => {
    const htmlItem = document.getElementsByClassName("note")[0] as HTMLElement;
    if (htmlItem) setSize({width: htmlItem.offsetWidth, height: htmlItem.offsetHeight});
  };

  useEffect(() => {
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDragging && currentOffset && item ? (
    <div className="board__custom-drag-layer">
      <div
        style={{
          transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
      >
        <Note noteId={item.id} viewer={viewer} />
      </div>
    </div>
  ) : null;
};

export default CustomDragLayer;
