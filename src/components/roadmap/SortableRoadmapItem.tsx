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
  isLoading?: boolean;
}

export function SortableRoadmapItem({ item, onUpdate, onDelete, onAdd, isLoading = false }: SortableRoadmapItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAdd = (parentId: string) => {
    onAdd(parentId);
  };

  return (
    <div ref={setNodeRef} style={style} className={`sortable-item ${isDragging ? "dragging" : ""}`} {...attributes}>
      {/* Przekazujemy listeners do drag handle w RoadmapItem */}
      <div {...listeners}>
        <RoadmapItem item={item} onUpdate={onUpdate} onDelete={onDelete} onAdd={handleAdd} isLoading={isLoading} />
      </div>
    </div>
  );
}
