import type { CreateRoadmapCommand } from "../types";
import type { TablesInsert } from "../db/database.types";

export async function generateRoadmapItems(
  roadmapData: CreateRoadmapCommand
): Promise<Omit<TablesInsert<"roadmap_items">, "roadmap_id" | "user_id">[]> {
  // Mock implementation - returns predefined structure
  // This will be replaced with actual AI implementation later
  return [
    {
      parent_item_id: null,
      title: "Getting Started",
      description: `Introduction to ${roadmapData.technology} basics`,
      level: 1,
      position: 1000,
      is_completed: false,
    },
    {
      parent_item_id: null,
      title: "Core Concepts",
      description: `Understanding ${roadmapData.technology} fundamentals`,
      level: 1,
      position: 2000,
      is_completed: false,
    },
    {
      parent_item_id: null,
      title: "Advanced Topics",
      description: `Deep dive into ${roadmapData.technology}`,
      level: 1,
      position: 3000,
      is_completed: false,
    },
  ];
}
