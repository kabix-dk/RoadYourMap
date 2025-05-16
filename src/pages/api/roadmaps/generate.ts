import type { APIRoute } from "astro";
import { z } from "zod";
import type { CreateRoadmapCommand } from "../../../types";
import { generateRoadmapItems } from "../../../lib/ai.service";

export const prerender = false;

// Validation schema for request body
const createRoadmapSchema = z.object({
  title: z.string().min(1).max(255),
  experience_level: z.string().min(1).max(50),
  technology: z.string().min(1).max(100),
  goals: z.string().min(1),
  additional_info: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createRoadmapSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          details: validationResult.error.errors,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const roadmapData = validationResult.data as CreateRoadmapCommand;

    // Generate mock roadmap items
    const items = await generateRoadmapItems(roadmapData);

    // Return mock response with generated items
    return new Response(
      JSON.stringify({
        roadmap: {
          id: "mock-id",
          ...roadmapData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: items.map((item, index) => ({
            id: `mock-item-${index + 1}`,
            ...item,
            completed_at: null,
          })),
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating roadmap:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
