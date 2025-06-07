import type { APIRoute } from "astro";
import { isValidUUID, CreateRoadmapItemSchema } from "@/lib/utils/validation";
import { RoadmapService } from "@/lib/services/roadmap.service";

const roadmapService = new RoadmapService();

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const { roadmapId } = params;

    // Get authenticated user and supabase client from middleware
    const { user, supabase } = locals;

    if (!user) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Authorization token required",
            code: "UNAUTHORIZED",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate UUID format for roadmapId parameter
    if (!roadmapId || !isValidUUID(roadmapId)) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid roadmap ID format",
            code: "INVALID_UUID",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid JSON in request body",
            code: "INVALID_JSON",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate request body using Zod schema
    const validation = CreateRoadmapItemSchema.safeParse(requestBody);
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Validation failed: " + validation.error.errors.map((e) => e.message).join(", "),
            code: "VALIDATION_ERROR",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const createCommand = validation.data;

    // Create roadmap item using service
    const result = await roadmapService.createRoadmapItem(supabase, roadmapId, createCommand);

    // Handle service response
    if (!result.success) {
      const statusCode = result.status || 500;
      const errorMessage = result.error || "An unexpected error occurred";

      return new Response(
        JSON.stringify({
          error: {
            message: errorMessage,
            code: statusCode === 404 ? "NOT_FOUND" : statusCode === 400 ? "VALIDATION_ERROR" : "INTERNAL_SERVER_ERROR",
          },
        }),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return created item with 201 status
    return new Response(JSON.stringify(result.data), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in POST /api/roadmaps/[roadmapId]/items:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: "Internal server error",
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
