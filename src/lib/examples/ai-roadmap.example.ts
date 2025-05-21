/**
 * Example demonstrating how to use the AiRoadmapService to generate roadmap items
 */

import { AiRoadmapService } from "../services/ai-roadmap.service";
import type { CreateRoadmapCommand } from "../../types";

/**
 * Basic example showing how to generate a roadmap for a specific technology
 */
export async function generateRoadmapExample(): Promise<void> {
  // Get API key from environment variables
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required in environment variables");
  }

  // Create an instance of AiRoadmapService
  const roadmapService = new AiRoadmapService(apiKey);

  try {
    // Define roadmap data
    const roadmapData: CreateRoadmapCommand = {
      title: "Learn Python Programming",
      technology: "Python",
      experience_level: "intermediate",
      goals: "Build web applications, automate tasks, analyze data",
      additional_info: "Focus on modern Python 3.x features and libraries.",
    };

    // Generate roadmap items using AI
    const roadmapItems = await roadmapService.generateRoadmapItems(roadmapData);

    console.log(`Generated ${roadmapItems.length} roadmap items for ${roadmapData.technology}`);

    // Print level 1 items and their immediate children
    const level1Items = roadmapItems.filter((item) => item.level === 1);

    level1Items.forEach((l1Item) => {
      console.log(`\nSection: ${l1Item.title}`);
      console.log(`Description: ${l1Item.description}`);

      // Find level 2 items that have this level 1 item as parent
      const level2Items = roadmapItems.filter((item) => item.level === 2 && item.parent_item_id === l1Item.id);

      level2Items.forEach((l2Item) => {
        console.log(`  - ${l2Item.title}: ${l2Item.description}`);

        // Find level 3 items that have this level 2 item as parent
        const level3Items = roadmapItems.filter((item) => item.level === 3 && item.parent_item_id === l2Item.id);

        level3Items.forEach((l3Item) => {
          console.log(`    * Task: ${l3Item.title}`);
          console.log(`      ${l3Item.description}`);
        });
      });
    });
  } catch (error) {
    console.error("Failed to generate roadmap:", error);
  }
}

/**
 * Example showing how to use the roadmap items with a specific difficulty level
 */
export async function generateAdvancedRoadmapExample(): Promise<void> {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required in environment variables");
  }

  const roadmapService = new AiRoadmapService(apiKey);

  try {
    // Create roadmap for advanced React development
    const roadmapData: CreateRoadmapCommand = {
      title: "Advanced React Development",
      technology: "React",
      experience_level: "advanced",
      goals: "Master component patterns, learn state management, build performant applications",
      additional_info: "Include latest React features like Server Components and React 19 updates.",
    };

    const roadmapItems = await roadmapService.generateRoadmapItems(roadmapData);

    // Count items by level
    const level1Count = roadmapItems.filter((item) => item.level === 1).length;
    const level2Count = roadmapItems.filter((item) => item.level === 2).length;
    const level3Count = roadmapItems.filter((item) => item.level === 3).length;

    console.log(`Generated roadmap stats for ${roadmapData.technology}:`);
    console.log(`- Main sections: ${level1Count}`);
    console.log(`- Subsections: ${level2Count}`);
    console.log(`- Tasks: ${level3Count}`);
    console.log(`- Total items: ${roadmapItems.length}`);

    // Example of extracting just the titles to display a simple overview
    const mainSections = roadmapItems.filter((item) => item.level === 1).map((item) => item.title);

    console.log("\nMain learning sections:");
    console.log(mainSections.join(", "));
  } catch (error) {
    console.error("Failed to generate advanced roadmap:", error);
  }
}
