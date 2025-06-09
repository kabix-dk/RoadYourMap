import React from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { RoadmapItem } from "./RoadmapItem";
import { SortableRoadmapItem } from "./SortableRoadmapItem";
import type { RoadmapItemViewModel } from "./types";

interface RoadmapTreeProps {
  items: RoadmapItemViewModel[];
  onReorder: (activeId: string, overId: string | null, newIndex: number) => void;
  onUpdate: (itemId: string, updates: { title?: string; description?: string; is_completed?: boolean }) => void;
  onDelete: (itemId: string) => void;
  onAdd: (parentId?: string) => void;
  isLoading?: boolean;
}

export function RoadmapTree({ items, onReorder, onUpdate, onDelete, onAdd, isLoading = false }: RoadmapTreeProps) {
  const [activeItem, setActiveItem] = React.useState<RoadmapItemViewModel | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Funkcja pomocnicza do spłaszczania drzewa dla DnD
  const flattenItems = (items: RoadmapItemViewModel[]): RoadmapItemViewModel[] => {
    const result: RoadmapItemViewModel[] = [];

    const traverse = (items: RoadmapItemViewModel[]) => {
      items.forEach((item) => {
        result.push(item);
        if (item.children && item.children.length > 0) {
          traverse(item.children);
        }
      });
    };

    traverse(items);
    return result;
  };

  const flatItems = flattenItems(items);
  const itemIds = flatItems.map((item) => item.id);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeItem = flatItems.find((item) => item.id === active.id);
    setActiveItem(activeItem || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeIndex = flatItems.findIndex((item) => item.id === active.id);
    const overIndex = flatItems.findIndex((item) => item.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1) {
      onReorder(active.id as string, over.id as string, overIndex);
    }
  };

  const handleAddRootItem = () => {
    onAdd();
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Brak elementów w roadmapie</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Dodaj pierwszy rozdział, aby rozpocząć budowanie swojej roadmapy.
          </p>
        </div>
        <button
          onClick={handleAddRootItem}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Dodaj pierwszy rozdział
        </button>
      </div>
    );
  }

  return (
    <div className="roadmap-tree">
      {/* Header z przyciskiem dodawania */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Elementy roadmapy</h2>
        <button
          onClick={handleAddRootItem}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          + Dodaj rozdział
        </button>
      </div>

      {/* DnD Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {items.map((item) => (
              <SortableRoadmapItem
                key={item.id}
                item={item}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAdd={onAdd}
                isLoading={isLoading}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeItem ? (
            <div className="opacity-90 transform rotate-2 shadow-lg">
              <RoadmapItem
                item={activeItem}
                onUpdate={() => undefined}
                onDelete={() => undefined}
                onAdd={() => undefined}
                isLoading={false}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
