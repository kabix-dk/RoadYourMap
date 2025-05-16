import type { Tables, TablesInsert, TablesUpdate } from "./db/database.types";

// Pagination metadata for list endpoints
export interface PaginationMetaDto {
  limit: number;
  offset: number;
  total: number;
}

// ===== Roadmap DTOs and Commands =====

// Roadmap summary for GET /api/roadmaps
export type RoadmapSummaryDto = Pick<
  Tables<"roadmaps">,
  "id" | "title" | "experience_level" | "technology" | "goals" | "created_at" | "updated_at"
>;

// Response shape for GET /api/roadmaps
export interface RoadmapListResponseDto {
  data: RoadmapSummaryDto[];
  pagination: PaginationMetaDto;
}

// Command model for POST /api/roadmaps
export type CreateRoadmapCommand = Pick<
  TablesInsert<"roadmaps">,
  "title" | "experience_level" | "technology" | "goals" | "additional_info"
>;

// Command model for PATCH /api/roadmaps/:roadmapId
export type UpdateRoadmapCommand = Partial<
  Pick<TablesUpdate<"roadmaps">, "title" | "experience_level" | "technology" | "goals" | "additional_info">
>;

// Full roadmap DTO (excluding internal user_id)
export type RoadmapDto = Omit<Tables<"roadmaps">, "user_id">;

// Detailed roadmap for GET /api/roadmaps/:roadmapId and POST response (with nested items)
export interface RoadmapDetailsDto extends RoadmapDto {
  items: RoadmapItemDto[];
}

// ===== Roadmap Item DTOs and Commands =====

// Roadmap item shape for nested lists and item responses
export type RoadmapItemDto = Pick<
  Tables<"roadmap_items">,
  "id" | "parent_item_id" | "title" | "description" | "level" | "position" | "is_completed" | "completed_at"
>;

// Command model for POST /api/roadmaps/:roadmapId/items
export type CreateRoadmapItemCommand = Pick<
  TablesInsert<"roadmap_items">,
  "parent_item_id" | "title" | "description" | "level" | "position"
>;

// Command model for PATCH /api/roadmaps/:roadmapId/items/:itemId
// At least one field should be provided; use Partial to allow updates
export type UpdateRoadmapItemCommand = Partial<
  Pick<TablesUpdate<"roadmap_items">, "title" | "description" | "level" | "position" | "is_completed">
>;

// Response shape for GET /api/roadmaps/:roadmapId/items
export interface RoadmapItemsResponseDto {
  items: RoadmapItemDto[];
}

// Full roadmap item record for POST and PATCH responses
export type RoadmapItemRecordDto = Tables<"roadmap_items">;
