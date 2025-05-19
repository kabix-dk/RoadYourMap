import type { APIRoute } from "astro";
import { isValidUUID } from "../../../lib/utils/validation";
import { RoadmapService } from "../../../lib/services/RoadmapService";
import { ADMIN_USER_ID } from "@/lib/utils";

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const roadmapId = params.roadmapId;

    // Validate UUID format
    if (!roadmapId || !isValidUUID(roadmapId)) {
      return new Response(JSON.stringify({ error: "Invalid roadmapId format. Must be a UUID." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Use admin user id from utils
    const userId = ADMIN_USER_ID;

    // Initialize service and delete roadmap
    const roadmapService = new RoadmapService();
    const result = await roadmapService.deleteRoadmap(roadmapId, userId);

    // Handle service response
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.status || 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return success with no content
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
