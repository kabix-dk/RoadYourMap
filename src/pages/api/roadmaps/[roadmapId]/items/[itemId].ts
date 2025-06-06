import type { APIRoute } from "astro";
import { isValidUUID } from "@/lib/utils/validation";
import { RoadmapService } from "@/lib/services/roadmap.service";

const roadmapService = new RoadmapService();

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const { roadmapId, itemId } = params;

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

    // Validate UUID format for path parameters using existing isValidUUID function
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

    if (!itemId || !isValidUUID(itemId)) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid item ID format",
            code: "INVALID_UUID",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
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

    // Update roadmap item using service (validation happens in service)
    const result = await roadmapService.updateRoadmapItem(supabase, roadmapId, itemId, requestBody);

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

    // Return updated item
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PATCH /api/roadmaps/[roadmapId]/items/[itemId]:", error);
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

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    const { roadmapId, itemId } = params;

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

    // Validate UUID format for path parameters
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

    if (!itemId || !isValidUUID(itemId)) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid item ID format",
            code: "INVALID_UUID",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
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

    // Update roadmap item with children using service
    const result = await roadmapService.updateRoadmapItemWithChildren(supabase, roadmapId, itemId, requestBody);

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

    // Return updated items
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in PUT /api/roadmaps/[roadmapId]/items/[itemId]:", error);
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
