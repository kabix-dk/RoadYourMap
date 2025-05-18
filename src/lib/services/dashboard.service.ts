import type { RoadmapSummaryDto } from "@/types";
import { supabaseAdmin } from "@/db/supabase.client";

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
  async getUserRoadmaps(userId: string): Promise<RoadmapSummaryDto[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from("roadmaps")
        .select("id, title, experience_level, technology, goals, created_at, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching user roadmaps:", error);
        throw new DashboardError("Failed to fetch roadmaps", 500);
      }

      return data || [];
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
