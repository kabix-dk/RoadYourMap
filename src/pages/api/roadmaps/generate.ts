import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { createRoadmapFormSchema } from "@/components/roadmap/RoadmapCreationForm";
// import { generateRoadmapItems } from "@/lib/temp/mocked.roadmap.service";
import { AiRoadmapService } from "@/lib/services/ai.roadmap.service";
import type { TablesInsert } from "@/db/database.types";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies }) => {
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

    // Parse and validate request body
    const data = await request.json();
    const validationResult = createRoadmapFormSchema.safeParse(data);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Bad Request", details: validationResult.error.errors }), {
        status: 400,
      });
    }

    // Create Supabase server instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Check roadmap limit
    const { count: roadmapCount, error: countError } = await supabase
      .from("roadmaps")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      return new Response(JSON.stringify({ error: "Internal Server Error", details: countError }), { status: 500 });
    }

    if (roadmapCount && roadmapCount >= 5) {
      return new Response(JSON.stringify({ error: "User has reached max roadmaps" }), { status: 400 });
    }

    // Get API key from environment variables
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is required in environment variables");
    }

    // Create an instance of AiRoadmapService
    const roadmapService = new AiRoadmapService(apiKey);

    // Generate roadmap items using AI
    // const items = await generateRoadmapItems(validationResult.data);
    const items = await roadmapService.generateRoadmapItems(validationResult.data);

    const { data: roadmap, error: roadmapError } = await supabase
      .from("roadmaps")
      .insert({
        ...validationResult.data,
        user_id: user.id,
      })
      .select()
      .single();

    if (roadmapError) {
      return new Response(JSON.stringify({ error: "Internal Server Error", details: roadmapError }), { status: 500 });
    }

    // Insert roadmap items
    const roadmapItems: TablesInsert<"roadmap_items">[] = items.map((item, index) => ({
      ...item,
      roadmap_id: roadmap.id,
      position: (index + 1) * 1000, // Gap-based ordering
    }));
    console.log("roadmapItems", roadmapItems);
    const { error: itemsError } = await supabase.from("roadmap_items").insert(roadmapItems);

    if (itemsError) {
      // Rollback by deleting the roadmap if items insertion fails
      await supabase.from("roadmaps").delete().eq("id", roadmap.id);
      console.log("itemsError", itemsError);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }

    // Get the complete roadmap with items
    const { data: roadmapWithItems, error: fetchError } = await supabase
      .from("roadmaps")
      .select(
        `
        *,
        items:roadmap_items(*)
      `
      )
      .eq("id", roadmap.id)
      .single();

    if (fetchError) {
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }

    // Remove user_id from response
    const { user_id: _, ...roadmapDto } = roadmapWithItems; // eslint-disable-line @typescript-eslint/no-unused-vars

    return new Response(JSON.stringify({ roadmap: roadmapDto }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error }), { status: 500 });
  }
};
