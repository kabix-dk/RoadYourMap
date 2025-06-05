import { supabaseAdmin, type SupabaseServerClient } from "@/db/supabase.client";
import { UpdateRoadmapItemSchema } from "@/lib/utils/validation";
import type {
  RoadmapDetailsDto,
  RoadmapDto,
  RoadmapItemDto,
  UpdateRoadmapItemCommand,
  RoadmapItemRecordDto,
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
}
