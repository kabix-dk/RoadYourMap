import { useState, useMemo, useCallback } from "react";
import type { RoadmapDetailsDto, RoadmapItemDto, CreateRoadmapItemCommand, UpdateRoadmapItemCommand } from "@/types";
import type { RoadmapItemViewModel, RoadmapEditorState, RoadmapEditorActions } from "../roadmap/types";

/**
 * Transformuje płaską listę elementów roadmapy w zagnieżdżoną strukturę drzewa
 */
function buildNestedItems(flatItems: RoadmapItemDto[]): RoadmapItemViewModel[] {
  const itemMap = new Map<string, RoadmapItemViewModel>();
  const rootItems: RoadmapItemViewModel[] = [];

  // Najpierw tworzymy wszystkie elementy z pustymi tablicami children
  flatItems.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [] });
  });

  // Następnie budujemy hierarchię
  flatItems.forEach((item) => {
    const viewModel = itemMap.get(item.id);
    if (!viewModel) return;

    if (item.parent_item_id) {
      const parent = itemMap.get(item.parent_item_id);
      if (parent) {
        parent.children.push(viewModel);
      }
      // If parent doesn't exist, item is orphaned and won't be included
    } else {
      rootItems.push(viewModel);
    }
  });

  // Sortujemy elementy według pozycji na każdym poziomie
  const sortByPosition = (items: RoadmapItemViewModel[]) => {
    items.sort((a, b) => a.position - b.position);
    items.forEach((item) => sortByPosition(item.children));
  };

  sortByPosition(rootItems);
  return rootItems;
}

export function useRoadmapEditor(initialData: RoadmapDetailsDto) {
  const [state, setState] = useState<RoadmapEditorState>({
    flatItems: initialData.items,
    isLoading: false,
    error: null,
  });

  // Zagnieżdżona struktura drzewa - obliczana z flatItems
  const nestedItems = useMemo(() => {
    return buildNestedItems(state.flatItems);
  }, [state.flatItems]);

  // Funkcja pomocnicza do aktualizacji stanu z obsługą błędów
  const updateState = useCallback((updates: Partial<RoadmapEditorState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Funkcja pomocnicza do wykonywania optymistycznych aktualizacji
  const performOptimisticUpdate = useCallback(
    async <T>(
      optimisticUpdate: () => RoadmapItemDto[],
      apiCall: (optimisticallyUpdatedItems: RoadmapItemDto[]) => Promise<T>,
      rollbackUpdate?: () => RoadmapItemDto[]
    ): Promise<T | null> => {
      const originalItems = state.flatItems;

      try {
        // Optymistyczna aktualizacja UI
        const newItems = optimisticUpdate();
        updateState({ flatItems: newItems, error: null });

        // Wywołanie API
        const result = await apiCall(newItems);
        return result;
      } catch (error) {
        // Rollback w przypadku błędu
        const itemsToRestore = rollbackUpdate ? rollbackUpdate() : originalItems;
        updateState({
          flatItems: itemsToRestore,
          error: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd",
        });
        return null;
      }
    },
    [state.flatItems, updateState]
  );

  const actions: RoadmapEditorActions = {
    addItem: useCallback(
      async (command) => {
        updateState({ isLoading: true });

        const siblings = state.flatItems.filter((item) => item.parent_item_id === (command.parent_item_id || null));
        const maxPosition = siblings.reduce((max, item) => Math.max(max, item.position), 0);

        const newItem: RoadmapItemDto = {
          id: `temp-${Date.now()}`, // Tymczasowe ID
          parent_item_id: command.parent_item_id || null,
          title: command.title,
          description: command.description || "",
          level: command.parent_item_id
            ? (state.flatItems.find((item) => item.id === command.parent_item_id)?.level || 0) + 1
            : 1,
          position: maxPosition * 1000,
          is_completed: false,
          completed_at: null,
        };

        await performOptimisticUpdate(
          () => [...state.flatItems, newItem],
          async (optimisticallyUpdatedItems) => {
            const createCommand: CreateRoadmapItemCommand = {
              parent_item_id: command.parent_item_id || null,
              title: command.title,
              description: command.description || "",
              level: newItem.level,
              position: newItem.position,
            };

            const response = await fetch(`/api/roadmaps/${initialData.id}/items`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(createCommand),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const createdItem = await response.json();

            // Aktualizujemy element z prawdziwym ID z serwera
            updateState({
              flatItems: optimisticallyUpdatedItems.map((item) =>
                item.id === newItem.id ? { ...createdItem, children: [] } : item
              ),
            });

            return createdItem;
          }
        );

        updateState({ isLoading: false });
      },
      [initialData.id, state.flatItems, updateState, performOptimisticUpdate]
    ),

    updateItem: useCallback(
      async (itemId, updates) => {
        updateState({ isLoading: true });

        const isCompletionUpdate = "is_completed" in updates;

        await performOptimisticUpdate(
          () => {
            if (isCompletionUpdate && typeof updates.is_completed === "boolean") {
              const isCompleted = updates.is_completed;
              const itemsToUpdate = new Set<string>();

              const findChildrenRecursive = (parentId: string) => {
                const children = state.flatItems.filter((item) => item.parent_item_id === parentId);
                for (const child of children) {
                  itemsToUpdate.add(child.id);
                  findChildrenRecursive(child.id);
                }
              };

              findChildrenRecursive(itemId);

              const completedAt = isCompleted ? new Date().toISOString() : null;

              return state.flatItems.map((item) => {
                if (item.id === itemId) {
                  return { ...item, ...updates, completed_at: completedAt };
                }
                if (itemsToUpdate.has(item.id)) {
                  return {
                    ...item,
                    is_completed: isCompleted,
                    completed_at: completedAt,
                  };
                }
                return item;
              });
            }
            return state.flatItems.map((item) => (item.id === itemId ? { ...item, ...updates } : item));
          },
          async () => {
            const updateCommand: UpdateRoadmapItemCommand = updates;
            const method = isCompletionUpdate ? "PUT" : "PATCH";

            const response = await fetch(`/api/roadmaps/${initialData.id}/items/${itemId}`, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updateCommand),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
          }
        );

        updateState({ isLoading: false });
      },
      [initialData.id, state.flatItems, updateState, performOptimisticUpdate]
    ),

    deleteItem: useCallback(
      async (itemId) => {
        updateState({ isLoading: true });

        // Znajdź element i wszystkie jego dzieci do usunięcia
        const findItemAndChildren = (id: string, items: RoadmapItemDto[]): string[] => {
          const result = [id];
          const children = items.filter((item) => item.parent_item_id === id);
          children.forEach((child) => {
            result.push(...findItemAndChildren(child.id, items));
          });
          return result;
        };

        const idsToDelete = findItemAndChildren(itemId, state.flatItems);

        await performOptimisticUpdate(
          () => state.flatItems.filter((item) => !idsToDelete.includes(item.id)),
          async () => {
            const response = await fetch(`/api/roadmaps/${initialData.id}/items/${itemId}`, {
              method: "DELETE",
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
          }
        );

        updateState({ isLoading: false });
      },
      [initialData.id, state.flatItems, updateState, performOptimisticUpdate]
    ),

    moveItem: useCallback(
      async (itemId: string, direction: "up" | "down") => {
        updateState({ isLoading: true, error: null });

        const originalItems = [...state.flatItems];

        const movingItem = originalItems.find((item) => item.id === itemId);
        if (!movingItem) {
          updateState({ isLoading: false, error: "Nie znaleziono elementu do przesunięcia." });
          return;
        }

        const siblings = originalItems
          .filter((item) => item.parent_item_id === movingItem.parent_item_id)
          .sort((a, b) => a.position - b.position);

        const siblingIndex = siblings.findIndex((item) => item.id === itemId);

        const swappedItem =
          direction === "up" && siblingIndex > 0
            ? siblings[siblingIndex - 1]
            : direction === "down" && siblingIndex < siblings.length - 1
              ? siblings[siblingIndex + 1]
              : null;

        if (!swappedItem) {
          updateState({ isLoading: false });
          return;
        }

        const optimisticItems = originalItems.map((item) => {
          if (item.id === movingItem.id) return { ...item, position: swappedItem.position };
          if (item.id === swappedItem.id) return { ...item, position: movingItem.position };
          return item;
        });
        updateState({ flatItems: optimisticItems });

        try {
          const tempPosition = Math.max(...originalItems.map((i) => i.position)) + 1;

          const apiCall = async (id: string, position: number) => {
            const response = await fetch(`/api/roadmaps/${initialData.id}/items/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ position }),
            });
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
          };

          await apiCall(movingItem.id, tempPosition);
          await apiCall(swappedItem.id, movingItem.position);
          await apiCall(movingItem.id, swappedItem.position);
        } catch (error) {
          updateState({
            flatItems: originalItems,
            error: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd podczas zmiany kolejności",
          });
        } finally {
          updateState({ isLoading: false });
        }
      },
      [initialData.id, state.flatItems, updateState]
    ),
  };

  return {
    ...state,
    nestedItems,
    actions,
  };
}
