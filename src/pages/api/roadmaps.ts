import type { APIRoute } from "astro";
import { dashboardService } from "@/lib/services/dashboard.service";
import { ADMIN_USER_ID } from "@/lib/utils";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Use admin user id from utils
    const userId = ADMIN_USER_ID;

    // Fetch user's roadmaps
    const roadmaps = await dashboardService.getUserRoadmaps(userId);

    // Return successful response
    return new Response(JSON.stringify({ roadmaps }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/roadmaps:", error);

    // Handle known errors
    if (error instanceof Error && "status" in error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: error.status as number,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle unexpected errors
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
