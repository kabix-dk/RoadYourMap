import type { CreateRoadmapCommand } from "../../types";
import type { TablesInsert } from "../../db/database.types";

export async function generateRoadmapItems(
  roadmapData: CreateRoadmapCommand
): Promise<Omit<TablesInsert<"roadmap_items">, "roadmap_id" | "user_id">[]> {
  // Mock implementation - returns predefined structure
  // This will be replaced with actual AI implementation later
  return [
    {
      id: "550e8400-e29b-41d4-a716-446655440000", // Getting Started
      parent_item_id: null,
      title: "Getting Started",
      description: `Introduction to ${roadmapData.technology} basics`,
      level: 1,
      position: 1000,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440001", // Core Concepts
      parent_item_id: null,
      title: "Core Concepts",
      description: `Understanding ${roadmapData.technology} fundamentals`,
      level: 1,
      position: 2000,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002", // Advanced Topics
      parent_item_id: null,
      title: "Advanced Topics",
      description: `Deep dive into ${roadmapData.technology}`,
      level: 1,
      position: 3000,
      is_completed: false,
    },
    // Level 2 items for "Getting Started"
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Install Java JDK",
      description: "Setup the Java Development Kit on your machine",
      level: 2,
      position: 1100,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Set up IDE",
      description: "Install and configure IntelliJ IDEA or Eclipse",
      level: 2,
      position: 1200,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440005",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Hello World Program",
      description: "Write and run your first Java application",
      level: 2,
      position: 1300,
      is_completed: false,
    },
    // Level 3 items for "Getting Started"
    {
      id: "550e8400-e29b-41d4-a716-446655440006",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440003",
      title: "Download Java JDK Installer",
      description: "Visit the official Java website and download the installer for your OS",
      level: 3,
      position: 1110,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440007",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440004",
      title: "Install Java Plugins in IDE",
      description: "Add the Java plugin or module in your IDE for syntax highlighting and code completion",
      level: 3,
      position: 1210,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440008",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440005",
      title: "Compile and Run HelloWorld.java",
      description: "Use `javac` to compile and `java` to execute your first Java program",
      level: 3,
      position: 1310,
      is_completed: false,
    },
    // Level 2 items for "Core Concepts"
    {
      id: "550e8400-e29b-41d4-a716-446655440009",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440001",
      title: "Object-Oriented Programming",
      description: "Learn classes, objects, inheritance, and polymorphism",
      level: 2,
      position: 2100,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440010",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440001",
      title: "Data Types and Variables",
      description: "Understand primitives, reference types, and type conversions",
      level: 2,
      position: 2200,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440011",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440001",
      title: "Control Structures",
      description: "Master if-else, loops, and switch statements",
      level: 2,
      position: 2300,
      is_completed: false,
    },
    // Level 3 items for "Core Concepts"
    {
      id: "550e8400-e29b-41d4-a716-446655440012",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440009",
      title: "Create Classes and Objects",
      description: "Define Java classes with fields and methods, then instantiate objects",
      level: 3,
      position: 2110,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440013",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440010",
      title: "Practice Variable Declarations",
      description: "Write code to declare and use different primitive and reference types in Java",
      level: 3,
      position: 2210,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440014",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440011",
      title: "Implement Conditional Logic",
      description: "Write if-else and switch-case statements to handle branching logic in your code",
      level: 3,
      position: 2310,
      is_completed: false,
    },
    // Level 2 items for "Advanced Topics"
    {
      id: "550e8400-e29b-41d4-a716-446655440015",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440002",
      title: "Stream API",
      description: "Work with Java Streams for functional-style operations",
      level: 2,
      position: 3100,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440016",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440002",
      title: "Concurrency",
      description: "Learn threads, executors, and synchronization in Java",
      level: 2,
      position: 3200,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440017",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440002",
      title: "Unit Testing",
      description: "Use JUnit and Mockito to write and run tests",
      level: 2,
      position: 3300,
      is_completed: false,
    },
    // Level 3 items for "Advanced Topics"
    {
      id: "550e8400-e29b-41d4-a716-446655440018",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440015",
      title: "Create a Stream from a Collection",
      description: "Use `List.stream()` to build a stream and apply intermediate operations like filter and map",
      level: 3,
      position: 3110,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440019",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440016",
      title: "Implement a Runnable Task",
      description: "Create a class that implements Runnable and execute it using an ExecutorService",
      level: 3,
      position: 3210,
      is_completed: false,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440020",
      parent_item_id: "550e8400-e29b-41d4-a716-446655440017",
      title: "Write a JUnit Test Case",
      description: "Create a test class using JUnit annotations and use assertions to verify behavior",
      level: 3,
      position: 3310,
      is_completed: false,
    },
  ];
}
