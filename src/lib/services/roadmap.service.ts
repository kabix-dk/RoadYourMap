import { supabaseAdmin } from "@/db/supabase.client";
import type { RoadmapDetailsDto, RoadmapDto, RoadmapItemDto } from "../../types";

interface DeleteResult {
  success: boolean;
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
}
