import type { SupabaseClient } from "../../db/supabase.client";
import type { RoadmapDetailsDto } from "../../types";

export async function getRoadmap(supabase: SupabaseClient, roadmapId: string): Promise<RoadmapDetailsDto> {
  const { data: roadmap, error } = await supabase
    .from("roadmaps")
    .select(
      `
      *,
      items:roadmap_items(*)
    `
    )
    .eq("id", roadmapId)
    .order("position", { foreignTable: "roadmap_items" })
    .single();

  if (error) {
    console.error("Error fetching roadmap details:", error);
    throw new Error(error.message === "No rows found" ? "Roadmap not found" : "Internal Server Error");
  }

  if (!roadmap) {
    throw new Error("Roadmap not found");
  }

  // Remove user_id from the response as per RoadmapDto type
  const { user_id: _, ...roadmapWithoutUserId } = roadmap;

  return {
    ...roadmapWithoutUserId,
    items: roadmap.items || [],
  };
}
