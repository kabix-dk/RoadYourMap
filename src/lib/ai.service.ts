import type { CreateRoadmapCommand } from "../types";
import type { TablesInsert } from "../db/database.types";

export async function generateRoadmapItems(
  roadmapData: CreateRoadmapCommand
): Promise<Omit<TablesInsert<"roadmap_items">, "roadmap_id" | "user_id">[]> {
  // Mock implementation - returns predefined structure
  // This will be replaced with actual AI implementation later
  return [
    {
      parent_item_id: null,
      title: "Getting Started",
      description: `Introduction to ${roadmapData.technology} basics`,
      level: 1,
      position: 1000,
      is_completed: false,
    },
    {
      parent_item_id: null,
      title: "Core Concepts",
      description: `Understanding ${roadmapData.technology} fundamentals`,
      level: 1,
      position: 2000,
      is_completed: false,
    },
    {
      parent_item_id: null,
      title: "Advanced Topics",
      description: `Deep dive into ${roadmapData.technology}`,
      level: 1,
      position: 3000,
      is_completed: false,
    },
    // Level 2 items for "Getting Started"
    {
      parent_item_id: "mock-item-1",
      title: "Install Java JDK",
      description: "Setup the Java Development Kit on your machine",
      level: 2,
      position: 1100,
      is_completed: false,
    },
    {
      parent_item_id: "mock-item-1",
      title: "Set up IDE",
      description: "Install and configure IntelliJ IDEA or Eclipse",
      level: 2,
      position: 1200,
      is_completed: false,
    },
    {
      parent_item_id: "mock-item-1",
      title: "Hello World Program",
      description: "Write and run your first Java application",
      level: 2,
      position: 1300,
      is_completed: false,
    },
    // Level 2 items for "Core Concepts"
    {
      parent_item_id: "mock-item-2",
      title: "Object-Oriented Programming",
      description: "Learn classes, objects, inheritance, and polymorphism",
      level: 2,
      position: 2100,
      is_completed: false,
    },
    {
      parent_item_id: "mock-item-2",
      title: "Data Types and Variables",
      description: "Understand primitives, reference types, and type conversions",
      level: 2,
      position: 2200,
      is_completed: false,
    },
    {
      parent_item_id: "mock-item-2",
      title: "Control Structures",
      description: "Master if-else, loops, and switch statements",
      level: 2,
      position: 2300,
      is_completed: false,
    },
    // Level 2 items for "Advanced Topics"
    {
      parent_item_id: "mock-item-3",
      title: "Stream API",
      description: "Work with Java Streams for functional-style operations",
      level: 2,
      position: 3100,
      is_completed: false,
    },
    {
      parent_item_id: "mock-item-3",
      title: "Concurrency",
      description: "Learn threads, executors, and synchronization in Java",
      level: 2,
      position: 3200,
      is_completed: false,
    },
    {
      parent_item_id: "mock-item-3",
      title: "Unit Testing",
      description: "Use JUnit and Mockito to write and run tests",
      level: 2,
      position: 3300,
      is_completed: false,
    },
  ];
}
