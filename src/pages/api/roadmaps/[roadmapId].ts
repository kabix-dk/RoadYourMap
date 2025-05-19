import type { APIRoute } from "astro";
import { isValidUUID } from "../../../lib/utils/validation";
import { RoadmapService } from "../../../lib/services/roadmap.service";
import { ADMIN_USER_ID } from "@/lib/utils";

const roadmapService = new RoadmapService();
const userId = ADMIN_USER_ID;

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

    // Delete roadmap
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

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const { roadmapId } = params;

    // 1. Validate UUID format
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

    // 2. Get and validate auth token
    // const authHeader = request.headers.get("Authorization");
    // if (!authHeader?.startsWith("Bearer ")) {
    //   return new Response(
    //     JSON.stringify({
    //       error: {
    //         message: "Brak tokena autoryzacyjnego.",
    //         code: "AUTH_TOKEN_MISSING",
    //       },
    //     }),
    //     {
    //       status: 401,
    //       headers: { "Content-Type": "application/json" },
    //     }
    //   );
    // }

    // 3. Get authenticated user
    // const {
    //   data: { user },
    //   error: authError,
    // } = await supabaseClient.auth.getUser();

    // if (authError || !user) {
    //   return new Response(
    //     JSON.stringify({
    //       error: {
    //         message: "Nieprawidłowy lub wygasły token.",
    //         code: "INVALID_AUTH_TOKEN",
    //       },
    //     }),
    //     {
    //       status: 401,
    //       headers: { "Content-Type": "application/json" },
    //     }
    //   );
    // }

    // 4. Get roadmap details from Admin user
    const roadmap = await roadmapService.getRoadmapDetails(roadmapId, userId);

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
