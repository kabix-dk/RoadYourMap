import { DndContext, MeasuringStrategy } from "@dnd-kit/core";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import type { RoadmapDetailsDto } from "@/types";
import { useRoadmapManager } from "@/components/hooks/useRoadmapManager";
import { RoadmapItemNode } from "./RoadmapItemNode";
import { Spinner } from "@/components/ui/spinner";

interface RoadmapDisplayProps {
  roadmapData: RoadmapDetailsDto;
}

export function RoadmapDisplay({ roadmapData }: RoadmapDisplayProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [roadmap, actions] = useRoadmapManager(roadmapData);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    // Prevent nesting beyond allowed levels
    const activeLevel = activeData.path.split(".").length;
    const overLevel = overData.path.split(".").length;

    if (activeLevel + overLevel > 3) return; // Maximum 3 levels
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const overData = over.data.current;
    if (!overData) return;

    // Calculate new position
    const overPath = overData.path as string;
    const overIndex = parseInt(overPath.split(".").pop() || "0", 10);

    actions.moveItem(activeId, overData.parentId as string | null, overIndex);
  };

  if (!roadmap) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <div className="space-y-4">
        <SortableContext items={roadmap.rootItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          {roadmap.rootItems.map((item, index) => (
            <RoadmapItemNode
              key={item.id}
              item={item}
              onTitleUpdate={actions.updateItemTitle}
              onDescriptionUpdate={actions.updateItemDescription}
              onToggleExpand={actions.toggleExpand}
              path={index.toString()}
              isActive={item.id === activeId}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}
