import { supabaseAdmin, type SupabaseServerClient } from "@/db/supabase.client";
import { UpdateRoadmapItemSchema } from "@/lib/utils/validation";
import type {
  RoadmapDetailsDto,
  RoadmapDto,
  RoadmapItemDto,
  UpdateRoadmapItemCommand,
  RoadmapItemRecordDto,
  CreateRoadmapItemCommand,
} from "../../types";

interface DeleteResult {
  success: boolean;
  status?: number;
  error?: string;
}

interface UpdateItemResult {
  success: boolean;
  data?: RoadmapItemRecordDto;
  status?: number;
  error?: string;
}

interface CreateItemResult {
  success: boolean;
  data?: RoadmapItemRecordDto;
  status?: number;
  error?: string;
}

export class RoadmapService {
  /**
   * Deletes a roadmap and its associated items (cascade delete)
   * @param roadmapId - UUID of the roadmap to delete
   * @param userId - UUID of the authenticated user (for logging/verification)
   * @returns DeleteResult indicating success or failure with status and error message
   */
  async deleteRoadmap(roadmapId: string, userId: string): Promise<DeleteResult> {
    try {
      // Log the operation attempt for audit purposes
      console.log(`User ${userId} attempting to delete roadmap ${roadmapId}`);

      // First check if the roadmap exists
      const { data: existingRoadmap, error: checkError } = await supabaseAdmin
        .from("roadmaps")
        .select()
        .eq("id", roadmapId)
        .single();

      if (checkError) {
        console.error(`Database error checking roadmap ${roadmapId} for user ${userId}:`, checkError);
        return {
          success: false,
          status: 500,
          error: "Database error occurred while checking roadmap",
        };
      }

      if (!existingRoadmap) {
        console.warn(`Roadmap ${roadmapId} not found or user ${userId} not authorized to delete it`);
        return {
          success: false,
          status: 404,
          error: "Roadmap not found or user not authorized",
        };
      }

      // Proceed with deletion if roadmap exists
      const { error: deleteError } = await supabaseAdmin.from("roadmaps").delete().eq("id", roadmapId);

      if (deleteError) {
        console.error(`Database error deleting roadmap ${roadmapId} for user ${userId}:`, deleteError);
        return {
          success: false,
          status: 500,
          error: "Database error occurred while deleting roadmap",
        };
      }

      console.log(`User ${userId} successfully deleted roadmap ${roadmapId}`);
      return { success: true };
    } catch (error) {
      console.error(`Unexpected error in deleteRoadmap for user ${userId}, roadmap ${roadmapId}:`, error);
      return {
        success: false,
        status: 500,
        error: "An unexpected error occurred while deleting roadmap",
      };
    }
  }

  async getRoadmapDetails(roadmapId: string, userId: string): Promise<RoadmapDetailsDto | null> {
    try {
      // 1. Get the roadmap
      const { data: roadmap, error: roadmapError } = await supabaseAdmin
        .from("roadmaps")
        .select("*")
        .eq("id", roadmapId)
        .eq("user_id", userId)
        .single();

      if (roadmapError || !roadmap) {
        console.error("Error fetching roadmap:", roadmapError);
        return null;
      }

      // 2. Get all roadmap items
      const { data: items, error: itemsError } = await supabaseAdmin
        .from("roadmap_items")
        .select("id, parent_item_id, title, description, level, position, is_completed, completed_at")
        .eq("roadmap_id", roadmapId)
        .order("position");

      if (itemsError) {
        console.error("Error fetching roadmap items:", itemsError);
        return null;
      }

      // 3. Transform to DTO
      const roadmapDto: RoadmapDto = {
        id: roadmap.id,
        title: roadmap.title,
        experience_level: roadmap.experience_level,
        technology: roadmap.technology,
        goals: roadmap.goals,
        additional_info: roadmap.additional_info,
        created_at: roadmap.created_at,
        updated_at: roadmap.updated_at,
      };

      return {
        ...roadmapDto,
        items: items as RoadmapItemDto[],
      };
    } catch (error) {
      console.error("Error in getRoadmapDetails:", error);
      throw error;
    }
  }

  /**
   * Updates a roadmap item with special logic for completion status
   * @param supabase - Supabase client instance from server context
   * @param roadmapId - UUID of the roadmap containing the item
   * @param itemId - UUID of the item to update
   * @param requestBody - Raw request body to validate
   * @returns UpdateItemResult indicating success or failure with updated data
   */
  async updateRoadmapItem(
    supabase: SupabaseServerClient,
    roadmapId: string,
    itemId: string,
    requestBody: unknown
  ): Promise<UpdateItemResult> {
    try {
      // Validate request body
      const validation = UpdateRoadmapItemSchema.safeParse(requestBody);
      if (!validation.success) {
        return {
          success: false,
          status: 400,
          error: "Validation failed: " + validation.error.errors.map((e) => e.message).join(", "),
        };
      }

      const updateData: UpdateRoadmapItemCommand = validation.data;

      // Log the operation attempt
      console.log(`Attempting to update item ${itemId} in roadmap ${roadmapId}`);

      // First verify that the roadmap exists and user has access (RLS will handle this)
      const { data: roadmap, error: roadmapError } = await supabase
        .from("roadmaps")
        .select("id")
        .eq("id", roadmapId)
        .single();

      if (roadmapError || !roadmap) {
        console.warn(`Roadmap ${roadmapId} not found or user not authorized`);
        return {
          success: false,
          status: 404,
          error: "Roadmap not found or user not authorized",
        };
      }

      // Prepare update data with special logic for completion status
      const updatePayload: UpdateRoadmapItemCommand & { completed_at?: string | null } = { ...updateData };

      // Handle completed_at timestamp logic
      if (updateData.is_completed !== undefined) {
        if (updateData.is_completed) {
          // Set completed_at to current timestamp when marking as completed
          updatePayload.completed_at = new Date().toISOString();
        } else {
          // Clear completed_at when marking as not completed
          updatePayload.completed_at = null;
        }
      }

      // Update the item with RLS policy ensuring user access
      const { data: updatedItem, error: updateError } = await supabase
        .from("roadmap_items")
        .update(updatePayload)
        .eq("id", itemId)
        .eq("roadmap_id", roadmapId)
        .select("*")
        .single();

      if (updateError) {
        console.error(`Database error updating item ${itemId}:`, updateError);

        // Handle specific database errors
        if (updateError.code === "PGRST116") {
          return {
            success: false,
            status: 404,
            error: "Roadmap item not found",
          };
        }

        return {
          success: false,
          status: 500,
          error: "Database error occurred while updating item",
        };
      }

      if (!updatedItem) {
        return {
          success: false,
          status: 404,
          error: "Roadmap item not found",
        };
      }

      console.log(`Successfully updated item ${itemId}`);
      return {
        success: true,
        data: updatedItem as RoadmapItemRecordDto,
      };
    } catch (error) {
      console.error(`Unexpected error in updateRoadmapItem for item ${itemId}:`, error);
      return {
        success: false,
        status: 500,
        error: "An unexpected error occurred while updating item",
      };
    }
  }

  /**
   * Updates a roadmap item along with all its children when completion status changes
   * @param supabase - Supabase client instance from server context
   * @param roadmapId - UUID of the roadmap containing the item
   * @param itemId - UUID of the item to update
   * @param requestBody - Raw request body to validate
   * @returns UpdateItemResult indicating success or failure with updated data
   */
  async updateRoadmapItemWithChildren(
    supabase: SupabaseServerClient,
    roadmapId: string,
    itemId: string,
    requestBody: unknown
  ): Promise<UpdateItemResult> {
    try {
      // Validate request body
      const validation = UpdateRoadmapItemSchema.safeParse(requestBody);
      if (!validation.success) {
        return {
          success: false,
          status: 400,
          error: "Validation failed: " + validation.error.errors.map((e) => e.message).join(", "),
        };
      }

      const updateData: UpdateRoadmapItemCommand = validation.data;

      // Log the operation attempt
      console.log(`Attempting to update item ${itemId} with children in roadmap ${roadmapId}`);

      // First verify that the roadmap exists and user has access (RLS will handle this)
      const { data: roadmap, error: roadmapError } = await supabase
        .from("roadmaps")
        .select("id")
        .eq("id", roadmapId)
        .single();

      if (roadmapError || !roadmap) {
        console.warn(`Roadmap ${roadmapId} not found or user not authorized`);
        return {
          success: false,
          status: 404,
          error: "Roadmap not found or user not authorized",
        };
      }

      // If we're updating completion status, we need to update children too
      if (updateData.is_completed !== undefined) {
        // Get all children of this item recursively
        const { data: allItems, error: itemsError } = await supabase
          .from("roadmap_items")
          .select("id, parent_item_id")
          .eq("roadmap_id", roadmapId);

        if (itemsError) {
          console.error(`Error fetching roadmap items:`, itemsError);
          return {
            success: false,
            status: 500,
            error: "Database error occurred while fetching items",
          };
        }

        // Find all children recursively
        const findAllChildren = (
          parentId: string,
          items: { id: string; parent_item_id: string | null }[]
        ): string[] => {
          const directChildren = items.filter((item) => item.parent_item_id === parentId);
          const allChildren = [...directChildren.map((child) => child.id)];

          directChildren.forEach((child) => {
            allChildren.push(...findAllChildren(child.id, items));
          });

          return allChildren;
        };

        const childrenIds = findAllChildren(itemId, allItems || []);
        const allItemsToUpdate = [itemId, ...childrenIds];

        // Prepare update data with special logic for completion status
        const updatePayload: UpdateRoadmapItemCommand & { completed_at?: string | null } = { ...updateData };

        // Handle completed_at timestamp logic
        if (updateData.is_completed) {
          // Set completed_at to current timestamp when marking as completed
          updatePayload.completed_at = new Date().toISOString();
        } else {
          // Clear completed_at when marking as not completed
          updatePayload.completed_at = null;
        }

        // Update all items (parent and children) in a single transaction
        const { data: updatedItems, error: updateError } = await supabase
          .from("roadmap_items")
          .update(updatePayload)
          .eq("roadmap_id", roadmapId)
          .in("id", allItemsToUpdate)
          .select("*");

        if (updateError) {
          console.error(`Database error updating items:`, updateError);
          return {
            success: false,
            status: 500,
            error: "Database error occurred while updating items",
          };
        }

        if (!updatedItems || updatedItems.length === 0) {
          return {
            success: false,
            status: 404,
            error: "Roadmap items not found",
          };
        }

        console.log(`Successfully updated ${updatedItems.length} items`);
        return {
          success: true,
          data: updatedItems[0] as RoadmapItemRecordDto, // Return the main item (first in array)
        };
      } else {
        // If not updating completion status, just update the single item
        return this.updateRoadmapItem(supabase, roadmapId, itemId, requestBody);
      }
    } catch (error) {
      console.error(`Unexpected error in updateRoadmapItemWithChildren for item ${itemId}:`, error);
      return {
        success: false,
        status: 500,
        error: "An unexpected error occurred while updating items",
      };
    }
  }

  /**
   * Creates a new roadmap item
   * @param supabase - Supabase client instance from server context
   * @param roadmapId - UUID of the roadmap to add the item to
   * @param createCommand - Validated create command data
   * @returns CreateItemResult indicating success or failure with created data
   */
  async createRoadmapItem(
    supabase: SupabaseServerClient,
    roadmapId: string,
    createCommand: CreateRoadmapItemCommand
  ): Promise<CreateItemResult> {
    try {
      // Log the operation attempt
      console.log(`Attempting to create item in roadmap ${roadmapId}`);

      // First verify that the roadmap exists and user has access (RLS will handle this)
      const { data: roadmap, error: roadmapError } = await supabase
        .from("roadmaps")
        .select("id")
        .eq("id", roadmapId)
        .single();

      if (roadmapError || !roadmap) {
        console.warn(`Roadmap ${roadmapId} not found or user not authorized`);
        return {
          success: false,
          status: 404,
          error: "Roadmap not found or user not authorized",
        };
      }

      // If parent_item_id is provided, verify it exists in the same roadmap
      if (createCommand.parent_item_id) {
        const { data: parentItem, error: parentError } = await supabase
          .from("roadmap_items")
          .select("id")
          .eq("id", createCommand.parent_item_id)
          .eq("roadmap_id", roadmapId)
          .single();

        if (parentError || !parentItem) {
          console.warn(`Parent item ${createCommand.parent_item_id} not found in roadmap ${roadmapId}`);
          return {
            success: false,
            status: 404,
            error: "Parent item not found in this roadmap",
          };
        }
      }

      // Prepare insert data
      const insertData = {
        roadmap_id: roadmapId,
        parent_item_id: createCommand.parent_item_id || null,
        title: createCommand.title,
        description: createCommand.description || null,
        level: createCommand.level,
        position: createCommand.position,
        is_completed: false,
        completed_at: null,
      };

      // Insert the new item
      const { data: newItem, error: insertError } = await supabase
        .from("roadmap_items")
        .insert(insertData)
        .select("*")
        .single();

      if (insertError) {
        console.error(`Database error creating item in roadmap ${roadmapId}:`, insertError);

        // Handle unique constraint violation (duplicate position)
        if (
          insertError.code === "23505" &&
          insertError.message?.includes("roadmap_items_roadmap_id_parent_item_id_position_key")
        ) {
          return {
            success: false,
            status: 400,
            error: "An item with this position already exists at this level",
          };
        }

        return {
          success: false,
          status: 500,
          error: "Database error occurred while creating item",
        };
      }

      if (!newItem) {
        return {
          success: false,
          status: 500,
          error: "Failed to create item",
        };
      }

      console.log(`Successfully created item ${newItem.id} in roadmap ${roadmapId}`);
      return {
        success: true,
        data: newItem as RoadmapItemRecordDto,
      };
    } catch (error) {
      console.error(`Unexpected error in createRoadmapItem for roadmap ${roadmapId}:`, error);
      return {
        success: false,
        status: 500,
        error: "An unexpected error occurred while creating item",
      };
    }
  }

  /**
   * Deletes a roadmap item and its children (cascade delete)
   * @param supabase - Supabase client instance from server context
   * @param roadmapId - UUID of the roadmap containing the item
   * @param itemId - UUID of the item to delete
   * @returns DeleteResult indicating success or failure with status and error message
   */
  async deleteRoadmapItem(supabase: SupabaseServerClient, roadmapId: string, itemId: string): Promise<DeleteResult> {
    try {
      // Log the operation attempt
      console.log(`Attempting to delete item ${itemId} from roadmap ${roadmapId}`);

      // First verify that the roadmap exists and user has access (RLS will handle this)
      const { data: roadmap, error: roadmapError } = await supabase
        .from("roadmaps")
        .select("id")
        .eq("id", roadmapId)
        .single();

      if (roadmapError || !roadmap) {
        console.warn(`Roadmap ${roadmapId} not found or user not authorized`);
        return {
          success: false,
          status: 404,
          error: "Roadmap not found or user not authorized",
        };
      }

      // Delete the item with RLS policy ensuring user access
      // ON DELETE CASCADE will automatically delete all child items
      const { error: deleteError, count } = await supabase
        .from("roadmap_items")
        .delete()
        .eq("id", itemId)
        .eq("roadmap_id", roadmapId);

      if (deleteError) {
        console.error(`Database error deleting item ${itemId}:`, deleteError);
        return {
          success: false,
          status: 500,
          error: "Database error occurred while deleting item",
        };
      }

      // Check if any rows were affected
      if (count === 0) {
        console.warn(`Item ${itemId} not found in roadmap ${roadmapId} or user not authorized`);
        return {
          success: false,
          status: 404,
          error: "Roadmap item not found",
        };
      }

      console.log(`Successfully deleted item ${itemId} from roadmap ${roadmapId}`);
      return { success: true };
    } catch (error) {
      console.error(`Unexpected error in deleteRoadmapItem for item ${itemId}:`, error);
      return {
        success: false,
        status: 500,
        error: "An unexpected error occurred while deleting item",
      };
    }
  }
}
