import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RoadmapItem } from "./RoadmapItem";
import type { RoadmapItemViewModel } from "./types";

interface SortableRoadmapItemProps {
  item: RoadmapItemViewModel;
  onUpdate: (itemId: string, updates: { title?: string; description?: string; is_completed?: boolean }) => void;
  onDelete: (itemId: string) => void;
  onAdd: (parentId?: string) => void;
  onReorder: (activeId: string, overId: string | null, newIndex: number) => void;
  isLoading?: boolean;
}

export function SortableRoadmapItem({
  item,
  onUpdate,
  onDelete,
  onAdd,
  onReorder,
  isLoading = false,
}: SortableRoadmapItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, setActivatorNodeRef } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAdd = (parentId: string) => {
    onAdd(parentId);
  };

  return (
    <div ref={setNodeRef} style={style} className={`sortable-item ${isDragging ? "dragging" : ""}`}>
      <RoadmapItem
        item={item}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAdd={handleAdd}
        onReorder={onReorder}
        isLoading={isLoading}
        dragHandleProps={{
          ref: setActivatorNodeRef,
          ...attributes,
          ...listeners,
        }}
      />
    </div>
  );
}
