import type { APIRoute } from "astro";
import { dashboardService } from "@/lib/services/dashboard.service";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request }) => {
  try {
    // hardcode admin user id - just for dev purposes
    const userId = "ea55fc94-ba42-47fc-bc46-e75664a8b2ba";

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
