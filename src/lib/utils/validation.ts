/**
 * Validates if a string is a valid UUID v4 format
 * @param uuid - The string to validate
 * @returns boolean indicating if the string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

import { z } from "zod";

/**
 * Zod schema for validating update roadmap item request body
 * At least one field must be provided for the update
 */
export const UpdateRoadmapItemSchema = z
  .object({
    title: z.string().min(1, "Title must not be empty").optional(),
    description: z.string().optional(),
    level: z.number().int().min(0, "Level must be a non-negative integer").optional(),
    position: z.number().int().min(0, "Position must be a non-negative integer").optional(),
    is_completed: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/**
 * Zod schema for validating create roadmap item request body
 * Required fields: title, level, position
 * Optional fields: parent_item_id, description
 */
export const CreateRoadmapItemSchema = z.object({
  parent_item_id: z.string().uuid("Parent item ID must be a valid UUID").nullable().optional(),
  title: z.string().min(1, "Title is required and must not be empty"),
  description: z.string().optional(),
  level: z.number().int().min(0, "Level must be a non-negative integer"),
  position: z.number().int().min(0, "Position must be a non-negative integer"),
});

/**
 * Zod schema for validating roadmap and item ID parameters from URL path
 * Both must be valid UUIDs
 */
export const RoadmapItemParamsSchema = z.object({
  roadmapId: z.string().uuid("Roadmap ID must be a valid UUID"),
  itemId: z.string().uuid("Item ID must be a valid UUID"),
});
