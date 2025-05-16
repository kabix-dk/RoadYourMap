import type { APIRoute } from "astro";
import { z } from "zod";
import { getRoadmap } from "../../../lib/services/roadmaps.service";

// Validation schema for roadmapId
const roadmapIdSchema = z.string().uuid({
  message: "Invalid roadmap ID format - must be a valid UUID",
});

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // Step 1: Validate roadmapId
    const validationResult = roadmapIdSchema.safeParse(params.roadmapId);
    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid roadmapId parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const roadmapId = validationResult.data;

    // Step 2: Get roadmap details using default user
    const roadmap = await getRoadmap(locals.supabase, roadmapId);

    // Step 3: Return response
    return new Response(JSON.stringify({ roadmap }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[GET] /api/roadmaps/[roadmapId] error:", error);

    if (error instanceof Error && error.message === "Roadmap not found") {
      return new Response(JSON.stringify({ error: "Roadmap not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
