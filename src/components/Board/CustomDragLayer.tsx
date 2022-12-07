import {Note} from "components/Note";
import {useEffect, useState} from "react";
import {DragLayerMonitor, useDragLayer} from "react-dnd";
import {useAppSelector} from "store";
import "./CustomDragLayer.scss";

const CustomDragLayer = () => {
  const [size, setSize] = useState({width: 0, height: 0});
  const viewer = useAppSelector((state) => state.participants!.self);

  const {isDragging, currenSourceOffset, currentOffset, item} = useDragLayer((monitor: DragLayerMonitor) => ({
    item: monitor.getItem(),
    currenSourceOffset: monitor.getSourceClientOffset(),
    currentOffset: monitor.getClientOffset(),
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

  if (isDragging && size.width === 0 && size.height === 0) {
    // initialize dimensions again, if they weren't properly setup in useEffect call
    handleResize();
  }

  return isDragging && currenSourceOffset && currentOffset && item ? (
    <div className="board__custom-drag-layer">
      <div
        style={{
          /* workaround for bug where currentSourceClientOffset values are NaN on first drag on touch devices */
          transform: `translate(
            ${!Number.isNaN(currenSourceOffset.x) ? currenSourceOffset.x : currentOffset.x - size.width / 2}px,
            ${!Number.isNaN(currenSourceOffset.y) ? currenSourceOffset.y : currentOffset.y - size.height / 2}px)`,
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
