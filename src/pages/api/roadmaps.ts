import type { APIRoute } from "astro";
import { dashboardService } from "@/lib/services/dashboard.service";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  try {
    // Get authenticated user from middleware
    const { user } = locals;

    if (!user) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Unauthorized",
            code: "UNAUTHORIZED",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Fetch user's roadmaps
    const roadmaps = await dashboardService.getUserRoadmaps(user.id);

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
