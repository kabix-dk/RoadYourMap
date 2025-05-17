import { useCallback, useState } from "react";
import type { RoadmapDetailsDto } from "@/types";
import type { RoadmapItemViewModel, RoadmapViewData } from "@/types/viewModels";
import { transformToViewData } from "@/types/viewModels";

interface RoadmapActions {
  updateItemTitle: (itemId: string, newTitle: string) => void;
  updateItemDescription: (itemId: string, newDescription: string) => void;
  toggleExpand: (itemId: string) => void;
  moveItem: (draggedId: string, targetParentId: string | null, newPosition: number) => void;
}

export function useRoadmapManager(initialData: RoadmapDetailsDto): [RoadmapViewData, RoadmapActions] {
  const [roadmapData, setRoadmapData] = useState<RoadmapViewData>(() => transformToViewData(initialData));

  const findItemById = useCallback(
    (itemId: string, items: RoadmapItemViewModel[] = roadmapData.rootItems): RoadmapItemViewModel | null => {
      for (const item of items) {
        if (item.id === itemId) return item;
        const found = findItemById(itemId, item.children);
        if (found) return found;
      }
      return null;
    },
    [roadmapData.rootItems]
  );

  const updateItemById = useCallback(
    (
      itemId: string,
      updater: (item: RoadmapItemViewModel) => void,
      items: RoadmapItemViewModel[] = roadmapData.rootItems
    ): RoadmapItemViewModel[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item };
          updater(updated);
          return updated;
        }
        return {
          ...item,
          children: updateItemById(itemId, updater, item.children),
        };
      });
    },
    [roadmapData.rootItems]
  );

  const updateItemTitle = useCallback(
    (itemId: string, newTitle: string) => {
      setRoadmapData((prev) => ({
        ...prev,
        rootItems: updateItemById(itemId, (item) => {
          item.title = newTitle;
          item.isEditingTitle = false;
        }),
      }));
    },
    [updateItemById]
  );

  const updateItemDescription = useCallback(
    (itemId: string, newDescription: string) => {
      setRoadmapData((prev) => ({
        ...prev,
        rootItems: updateItemById(itemId, (item) => {
          item.description = newDescription;
          item.isEditingDescription = false;
        }),
      }));
    },
    [updateItemById]
  );

  const toggleExpand = useCallback(
    (itemId: string) => {
      setRoadmapData((prev) => ({
        ...prev,
        rootItems: updateItemById(itemId, (item) => {
          item.isExpanded = !item.isExpanded;
        }),
      }));
    },
    [updateItemById]
  );

  const moveItem = useCallback(
    (draggedId: string, targetParentId: string | null, newPosition: number) => {
      const draggedItem = findItemById(draggedId);
      if (!draggedItem) return;

      // Remove item from its current position
      const removeItem = (items: RoadmapItemViewModel[]): RoadmapItemViewModel[] => {
        return items.filter((item) => {
          if (item.id === draggedId) return false;
          item.children = removeItem(item.children);
          return true;
        });
      };

      // Insert item at new position
      const insertItem = (items: RoadmapItemViewModel[]): RoadmapItemViewModel[] => {
        if (targetParentId === null && items === roadmapData.rootItems) {
          const result = [...items];
          result.splice(newPosition, 0, { ...draggedItem, parentId: null });
          return result;
        }

        return items.map((item) => {
          if (item.id === targetParentId) {
            const children = [...item.children];
            children.splice(newPosition, 0, { ...draggedItem, parentId: targetParentId });
            return { ...item, children };
          }
          return { ...item, children: insertItem(item.children) };
        });
      };

      setRoadmapData((prev) => {
        const withoutDraggedItem = {
          ...prev,
          rootItems: removeItem(prev.rootItems),
        };
        return {
          ...withoutDraggedItem,
          rootItems: insertItem(withoutDraggedItem.rootItems),
        };
      });
    },
    [findItemById, roadmapData.rootItems]
  );

  return [
    roadmapData,
    {
      updateItemTitle,
      updateItemDescription,
      toggleExpand,
      moveItem,
    },
  ];
}
