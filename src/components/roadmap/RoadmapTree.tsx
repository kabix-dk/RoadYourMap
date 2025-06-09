import React from "react";
import { RoadmapItem } from "./RoadmapItem";
import type { RoadmapItemViewModel } from "./types";

interface RoadmapTreeProps {
  items: RoadmapItemViewModel[];
  onMoveItem: (itemId: string, direction: "up" | "down") => void;
  onUpdate: (itemId: string, updates: { title?: string; description?: string; is_completed?: boolean }) => void;
  onDelete: (itemId: string) => void;
  onAdd: (parentId?: string) => void;
  isLoading?: boolean;
}

export function RoadmapTree({ items, onMoveItem, onUpdate, onDelete, onAdd, isLoading = false }: RoadmapTreeProps) {
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

      <div className="space-y-4">
        {items.map((item, index) => (
          <RoadmapItem
            key={item.id}
            item={item}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAdd={onAdd}
            onMoveItem={onMoveItem}
            isLoading={isLoading}
            itemIndex={index}
            totalItems={items.length}
          />
        ))}
      </div>
    </div>
  );
}
