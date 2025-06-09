import { useState, useMemo, useCallback } from "react";
import type { RoadmapDetailsDto, RoadmapItemDto, CreateRoadmapItemCommand, UpdateRoadmapItemCommand } from "@/types";
import type { RoadmapItemViewModel, RoadmapEditorState, RoadmapEditorActions } from "./types";

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

/**
 * Oblicza nową pozycję dla elementu na podstawie operacji drag-and-drop
 */
function calculateNewPosition(
  flatItems: RoadmapItemDto[],
  activeId: string,
  overId: string | null,
  newIndex: number
): { position: number; parent_item_id: string | null; level: number } {
  // Implementacja będzie dodana w kolejnych krokach
  // Na razie zwracamy podstawowe wartości
  const activeItem = flatItems.find((item) => item.id === activeId);
  if (!activeItem) {
    throw new Error("Active item not found");
  }

  return {
    position: newIndex,
    parent_item_id: activeItem.parent_item_id,
    level: activeItem.level,
  };
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
      apiCall: () => Promise<T>,
      rollbackUpdate?: () => RoadmapItemDto[]
    ): Promise<T | null> => {
      const originalItems = state.flatItems;

      try {
        // Optymistyczna aktualizacja UI
        const newItems = optimisticUpdate();
        updateState({ flatItems: newItems, error: null });

        // Wywołanie API
        const result = await apiCall();
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

        const newItem: RoadmapItemDto = {
          id: `temp-${Date.now()}`, // Tymczasowe ID
          parent_item_id: command.parent_item_id || null,
          title: command.title,
          description: command.description || "",
          level: command.parent_item_id
            ? (state.flatItems.find((item) => item.id === command.parent_item_id)?.level || 0) + 1
            : 1,
          position: state.flatItems.filter((item) => item.parent_item_id === (command.parent_item_id || null)).length,
          is_completed: false,
          completed_at: null,
        };

        await performOptimisticUpdate(
          () => [...state.flatItems, newItem],
          async () => {
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
              flatItems: state.flatItems.map((item) =>
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

        await performOptimisticUpdate(
          () => state.flatItems.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
          async () => {
            const updateCommand: UpdateRoadmapItemCommand = updates;

            const response = await fetch(`/api/roadmaps/${initialData.id}/items/${itemId}`, {
              method: "PATCH",
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

    reorderItems: useCallback(
      async (activeId, overId, newIndex) => {
        updateState({ isLoading: true });

        try {
          const { position, parent_item_id, level } = calculateNewPosition(state.flatItems, activeId, overId, newIndex);

          await performOptimisticUpdate(
            () =>
              state.flatItems.map((item) =>
                item.id === activeId ? { ...item, position, parent_item_id, level } : item
              ),
            async () => {
              const updateCommand: UpdateRoadmapItemCommand = {
                position,
                level,
              };

              const response = await fetch(`/api/roadmaps/${initialData.id}/items/${activeId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateCommand),
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              return await response.json();
            }
          );
        } catch (error) {
          updateState({
            error: error instanceof Error ? error.message : "Błąd podczas zmiany kolejności",
          });
        }

        updateState({ isLoading: false });
      },
      [initialData.id, state.flatItems, updateState, performOptimisticUpdate]
    ),
  };

  return {
    ...state,
    nestedItems,
    actions,
  };
}
