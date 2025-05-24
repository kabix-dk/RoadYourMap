import type { APIRoute } from "astro";
import { isValidUUID } from "../../../lib/utils/validation";
import { RoadmapService } from "../../../lib/services/roadmap.service";

const roadmapService = new RoadmapService();

export const prerender = false;

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const roadmapId = params.roadmapId;

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

    // Validate UUID format
    if (!roadmapId || !isValidUUID(roadmapId)) {
      return new Response(JSON.stringify({ error: "Invalid roadmapId format. Must be a UUID." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete roadmap
    const result = await roadmapService.deleteRoadmap(roadmapId, user.id);

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

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { roadmapId } = params;

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

    // Validate UUID format
    if (!roadmapId || !isValidUUID(roadmapId)) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Nieprawidłowy format ID roadmapy.",
            code: "INVALID_UUID",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get roadmap details for authenticated user
    const roadmap = await roadmapService.getRoadmapDetails(roadmapId, user.id);

    if (!roadmap) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Roadmapa nie została znaleziona lub nie masz do niej uprawnień.",
            code: "ROADMAP_NOT_FOUND",
          },
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ roadmap }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/roadmaps/[roadmapId]:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: "Wystąpił nieoczekiwany błąd serwera.",
          code: "INTERNAL_SERVER_ERROR",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
