import type { RoadmapDetailsDto } from "@/types";

export interface RoadmapItemViewModel {
  id: string;
  parentId: string | null;
  title: string;
  description: string | null;
  level: number;
  position: number;
  isCompleted: boolean;
  children: RoadmapItemViewModel[];
  isExpanded: boolean;
  isEditingTitle: boolean;
  isEditingDescription: boolean;
}

export interface RoadmapViewData {
  id: string;
  title: string;
  experience_level: string;
  technology: string;
  goals: string;
  additional_info: string | null;
  created_at: string;
  updated_at: string;
  rootItems: RoadmapItemViewModel[];
}

export function transformToViewData(dto: RoadmapDetailsDto): RoadmapViewData {
  if (!dto || !dto.items) {
    throw new Error("Invalid roadmap data: missing required properties");
  }

  // Create a map of all items for easy lookup
  const itemsMap = new Map<string, RoadmapItemViewModel>();

  // First pass: Create all items without children
  dto.items.forEach((item) => {
    itemsMap.set(item.id, {
      id: item.id,
      parentId: item.parent_item_id,
      title: item.title,
      description: item.description,
      level: item.level,
      position: item.position,
      isCompleted: item.is_completed,
      children: [],
      isExpanded: true, // Default to expanded
      isEditingTitle: false,
      isEditingDescription: false,
    });
  });

  // Second pass: Build the tree structure
  const rootItems: RoadmapItemViewModel[] = [];
  dto.items.forEach((item) => {
    const viewModel = itemsMap.get(item.id);
    if (!viewModel) {
      return; // Skip if item not found in map
    }

    if (item.parent_item_id === null) {
      rootItems.push(viewModel);
    } else {
      const parent = itemsMap.get(item.parent_item_id);
      if (parent) {
        parent.children.push(viewModel);
      }
    }
  });

  // Sort root items and children by position
  const sortByPosition = (a: RoadmapItemViewModel, b: RoadmapItemViewModel) => a.position - b.position;
  rootItems.sort(sortByPosition);
  rootItems.forEach((item) => {
    item.children.sort(sortByPosition);
  });

  return {
    id: dto.id,
    title: dto.title,
    experience_level: dto.experience_level,
    technology: dto.technology,
    goals: dto.goals,
    additional_info: dto.additional_info,
    created_at: dto.created_at,
    updated_at: dto.updated_at,
    rootItems,
  };
}
