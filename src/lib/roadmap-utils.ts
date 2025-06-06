import type { RoadmapItemDto } from "@/types";
import type { RoadmapItemViewModel } from "@/components/views/RoadmapDetailsView.types";

/**
 * Przekształca płaską listę elementów roadmapy w hierarchiczną strukturę drzewa
 */
export function buildRoadmapTree(items: RoadmapItemDto[]): RoadmapItemViewModel[] {
  if (!items || items.length === 0) {
    return [];
  }

  // Mapa do szybkiego dostępu do elementów po ID
  const itemsMap = new Map<string, RoadmapItemViewModel>();

  // Inicjalizuj wszystkie elementy z pustą tablicą children
  items.forEach((item) => {
    itemsMap.set(item.id, {
      ...item,
      children: [],
    });
  });

  // Tablica dla elementów głównych (bez parent_item_id)
  const rootItems: RoadmapItemViewModel[] = [];

  // Buduj hierarchię
  items.forEach((item) => {
    const viewModel = itemsMap.get(item.id);
    if (!viewModel) return;

    if (item.parent_item_id) {
      // Element ma rodzica - dodaj go do children rodzica
      const parent = itemsMap.get(item.parent_item_id);
      if (parent) {
        parent.children.push(viewModel);
      } else {
        // Rodzic nie istnieje - traktuj jako element główny
        rootItems.push(viewModel);
      }
    } else {
      // Element główny
      rootItems.push(viewModel);
    }
  });

  // Sortuj elementy według pozycji na każdym poziomie
  const sortByPosition = (items: RoadmapItemViewModel[]) => {
    items.sort((a, b) => a.position - b.position);
    items.forEach((item) => {
      if (item.children.length > 0) {
        sortByPosition(item.children);
      }
    });
  };

  sortByPosition(rootItems);
  return rootItems;
}

/**
 * Oblicza postęp ukończenia roadmapy w procentach
 */
export function calculateProgress(items: RoadmapItemViewModel[]): number {
  if (!items || items.length === 0) {
    return 0;
  }

  let totalItems = 0;
  let completedItems = 0;

  const countItems = (itemList: RoadmapItemViewModel[]) => {
    itemList.forEach((item) => {
      totalItems++;
      if (item.is_completed) {
        completedItems++;
      }
      if (item.children.length > 0) {
        countItems(item.children);
      }
    });
  };

  countItems(items);

  return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
}

/**
 * Aktualizuje status ukończenia elementu w drzewie (immutable)
 * Gdy element zostaje oznaczony jako ukończony, wszystkie jego pod-elementy również zostają ukończone
 * Gdy element zostaje odznaczony, wszystkie jego pod-elementy również zostają odznaczone
 */
export function updateItemCompletionStatus(
  items: RoadmapItemViewModel[],
  itemId: string,
  isCompleted: boolean
): RoadmapItemViewModel[] {
  return items.map((item) => {
    if (item.id === itemId) {
      // Funkcja pomocnicza do rekurencyjnego aktualizowania wszystkich pod-elementów
      const updateChildrenRecursively = (children: RoadmapItemViewModel[]): RoadmapItemViewModel[] => {
        return children.map((child) => ({
          ...child,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          children: updateChildrenRecursively(child.children),
        }));
      };

      return {
        ...item,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        children: updateChildrenRecursively(item.children),
      };
    }

    if (item.children.length > 0) {
      return {
        ...item,
        children: updateItemCompletionStatus(item.children, itemId, isCompleted),
      };
    }

    return item;
  });
}
