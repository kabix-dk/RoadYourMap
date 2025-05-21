import type { CreateRoadmapCommand } from "../../types";
import type { TablesInsert } from "../../db/database.types";
import { OpenRouterService } from "./OpenRouterService";

/**
 * Service that uses AI to generate roadmap items based on user input
 */
export class AiRoadmapService {
  private readonly openRouter: OpenRouterService;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("OpenRouter API key is required");
    }

    this.openRouter = new OpenRouterService({
      apiKey,
      defaultModel: "openai/gpt-4o-mini",
      defaultParams: {
        temperature: 0.7,
        max_tokens: 4096,
      },
    });
  }

  /**
   * Generates roadmap items using AI based on user input
   */
  async generateRoadmapItems(
    roadmapData: CreateRoadmapCommand
  ): Promise<Omit<TablesInsert<"roadmap_items">, "roadmap_id" | "user_id">[]> {
    try {
      const result = await this.openRouter.sendMessage({
        systemMessage:
          "You are an expert in creating learning roadmaps. Generate a comprehensive, hierarchical learning path for the given technology or topic.",
        userMessage: `Create a detailed learning roadmap for ${roadmapData.technology} with the following requirements:
           - The roadmap should have 3 main sections (level 1): "Getting Started", "Core Concepts", and "Advanced Topics"
           - Each section should have 3 subsections (level 2)
           - Each subsection should have 1 specific task or exercise (level 3)
           - Your response should be a JSON array of items, where each item includes: id (UUID), parent_item_id (null for level 1), title, description, level (1, 2, or 3), position (incremental number for ordering), and is_completed (false).
           
           Respond with a JSON object that has an 'items' property containing the array of roadmap items.`,
        responseFormat: {
          type: "json_schema",
          json_schema: {
            name: "RoadmapItems",
            strict: true,
            schema: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      parent_item_id: { type: ["string", "null"] },
                      title: { type: "string" },
                      description: { type: "string" },
                      level: { type: "number" },
                      position: { type: "number" },
                      is_completed: { type: "boolean" },
                    },
                    required: ["id", "parent_item_id", "title", "description", "level", "position", "is_completed"],
                  },
                },
              },
              required: ["items"],
            },
          },
        },
      });

      // Verify the result structure
      const typedResult = result as { items?: Omit<TablesInsert<"roadmap_items">, "roadmap_id" | "user_id">[] };

      // Handle direct array response or object with items property
      let validItems: Omit<TablesInsert<"roadmap_items">, "roadmap_id" | "user_id">[];

      if (Array.isArray(result)) {
        // If the AI returned a direct array instead of an object with items
        validItems = result as Omit<TablesInsert<"roadmap_items">, "roadmap_id" | "user_id">[];
      } else if (typedResult.items && Array.isArray(typedResult.items)) {
        // If the AI correctly returned an object with items array
        validItems = typedResult.items;
      } else {
        // Neither format is valid, throw an error
        throw new Error("Invalid response format from AI service: items array not found");
      }

      // Validate that we have received items in the expected format
      if (validItems.length === 0) {
        throw new Error("Empty roadmap items list received from AI service");
      }

      // Ensure all items have is_completed set to false
      const validatedItems = validItems.map((item) => ({
        ...item,
        is_completed: false,
      }));

      return validatedItems;
    } catch (error) {
      console.error("Error generating roadmap items with AI:", error);

      // Return fallback items in case of error
      return this.generateFallbackRoadmapItems(roadmapData);
    }
  }

  /**
   * Generates a basic fallback roadmap structure if AI generation fails
   */
  private generateFallbackRoadmapItems(
    roadmapData: CreateRoadmapCommand
  ): Omit<TablesInsert<"roadmap_items">, "roadmap_id" | "user_id">[] {
    // Create a basic structure with 3 top-level items
    const items: Omit<TablesInsert<"roadmap_items">, "roadmap_id" | "user_id">[] = [
      {
        id: this.generateSimpleId(),
        parent_item_id: null,
        title: "Getting Started",
        description: `Introduction to ${roadmapData.technology} basics`,
        level: 1,
        position: 1000,
        is_completed: false,
      },
      {
        id: this.generateSimpleId(),
        parent_item_id: null,
        title: "Core Concepts",
        description: `Understanding ${roadmapData.technology} fundamentals`,
        level: 1,
        position: 2000,
        is_completed: false,
      },
      {
        id: this.generateSimpleId(),
        parent_item_id: null,
        title: "Advanced Topics",
        description: `Deep dive into ${roadmapData.technology}`,
        level: 1,
        position: 3000,
        is_completed: false,
      },
    ];

    return items;
  }

  /**
   * Generates a simple ID string
   */
  private generateSimpleId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2, 11);
  }
}
