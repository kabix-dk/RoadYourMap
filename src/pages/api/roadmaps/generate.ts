import type { APIRoute } from "astro";
import { supabaseAdmin, DEFAULT_USER_ID } from "@/db/supabase.client";
import { createRoadmapFormSchema } from "@/components/roadmap/RoadmapCreationForm";
import { generateRoadmapItems } from "@/lib/mocked.roadmap.service";
import type { TablesInsert } from "@/db/database.types";

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate request body
    const data = await request.json();
    const validationResult = createRoadmapFormSchema.safeParse(data);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Bad Request", details: validationResult.error.errors }), {
        status: 400,
      });
    }

    // Check roadmap limit
    const { count: roadmapCount, error: countError } = await supabaseAdmin
      .from("roadmaps")
      .select("id", { count: "exact", head: true })
      .eq("user_id", DEFAULT_USER_ID);

    if (countError) {
      console.error("Error counting roadmaps:", countError);
      return new Response(JSON.stringify({ error: "Internal Server Error", details: countError }), { status: 500 });
    }

    if (roadmapCount && roadmapCount >= 5) {
      return new Response(JSON.stringify({ error: "User has reached max roadmaps" }), { status: 400 });
    }

    // Generate roadmap items using AI
    const items = await generateRoadmapItems(validationResult.data);

    const { data: roadmap, error: roadmapError } = await supabaseAdmin
      .from("roadmaps")
      .insert({
        ...validationResult.data,
        user_id: DEFAULT_USER_ID,
      })
      .select()
      .single();

    if (roadmapError) {
      console.error("Error inserting roadmap:", roadmapError);
      return new Response(JSON.stringify({ error: "Internal Server Error", details: roadmapError }), { status: 500 });
    }

    // Insert roadmap items
    const roadmapItems: TablesInsert<"roadmap_items">[] = items.map((item, index) => ({
      ...item,
      roadmap_id: roadmap.id,
      position: (index + 1) * 1000, // Gap-based ordering
    }));

    const { error: itemsError } = await supabaseAdmin.from("roadmap_items").insert(roadmapItems);

    if (itemsError) {
      console.log("Error inserting roadmap items:", itemsError);
      // Rollback by deleting the roadmap if items insertion fails
      await supabaseAdmin.from("roadmaps").delete().eq("id", roadmap.id);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }

    // Get the complete roadmap with items
    const { data: roadmapWithItems, error: fetchError } = await supabaseAdmin
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
    const { user_id: _, ...roadmapDto } = roadmapWithItems;

    return new Response(JSON.stringify({ roadmap: roadmapDto }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating roadmap (full error):", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error }), { status: 500 });
  }
};
