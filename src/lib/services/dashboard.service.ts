import type { RoadmapSummaryWithProgressDto, RoadmapItemDto } from "@/types";
import { supabaseAdmin } from "@/db/supabase.client";
import { calculateProgress, buildRoadmapTree } from "@/lib/roadmap-utils";

export class DashboardError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "DashboardError";
  }
}

export class DashboardService {
  async getUserRoadmaps(userId: string): Promise<RoadmapSummaryWithProgressDto[]> {
    try {
      const { data: roadmaps, error } = await supabaseAdmin
        .from("roadmaps")
        .select("id, title, experience_level, technology, goals, created_at, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching user roadmaps:", error);
        throw new DashboardError("Failed to fetch roadmaps", 500);
      }

      if (!roadmaps || roadmaps.length === 0) {
        return [];
      }

      // Fetch roadmap items for all roadmaps to calculate progress
      const roadmapIds = roadmaps.map((r) => r.id);
      const { data: allItems, error: itemsError } = await supabaseAdmin
        .from("roadmap_items")
        .select("id, parent_item_id, title, description, level, position, is_completed, completed_at, roadmap_id")
        .in("roadmap_id", roadmapIds);

      if (itemsError) {
        console.error("Error fetching roadmap items:", itemsError);
        throw new DashboardError("Failed to fetch roadmap items", 500);
      }

      // Calculate progress for each roadmap
      const roadmapsWithProgress: RoadmapSummaryWithProgressDto[] = roadmaps.map((roadmap) => {
        const roadmapItems = (allItems || []).filter((item) => item.roadmap_id === roadmap.id);
        const itemsAsDto: RoadmapItemDto[] = roadmapItems.map((item) => ({
          id: item.id,
          parent_item_id: item.parent_item_id,
          title: item.title,
          description: item.description,
          level: item.level,
          position: item.position,
          is_completed: item.is_completed,
          completed_at: item.completed_at,
        }));

        // Build tree and calculate progress
        const tree = buildRoadmapTree(itemsAsDto);
        const progress = calculateProgress(tree);

        return {
          ...roadmap,
          progress,
        };
      });

      return roadmapsWithProgress;
    } catch (error) {
      if (error instanceof DashboardError) {
        throw error;
      }
      console.error("Unexpected error in getUserRoadmaps:", error);
      throw new DashboardError("An unexpected error occurred", 500);
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
