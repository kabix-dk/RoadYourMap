import type { RoadmapItemDto, RoadmapDto } from "@/types";

/**
 * ViewModel dla pojedynczego elementu roadmapy w drzewie UI.
 * Rozszerza standardowe DTO o tablicę zagnieżdżonych dzieci.
 */
export interface RoadmapItemViewModel extends RoadmapItemDto {
  children: RoadmapItemViewModel[];
}

/**
 * ViewModel dla całego edytora, zawierający zagnieżdżoną strukturę
 * i metadane roadmapy.
 */
export interface RoadmapEditorViewModel extends RoadmapDto {
  items: RoadmapItemViewModel[];
}

/**
 * Stan hooka useRoadmapEditor
 */
export interface RoadmapEditorState {
  flatItems: RoadmapItemDto[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Akcje dostępne w edytorze roadmapy
 */
export interface RoadmapEditorActions {
  addItem: (command: { parent_item_id?: string; title: string; description?: string }) => Promise<void>;
  updateItem: (
    itemId: string,
    updates: { title?: string; description?: string; is_completed?: boolean }
  ) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  moveItem: (itemId: string, direction: "up" | "down") => Promise<void>;
}
