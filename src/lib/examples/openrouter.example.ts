/**
 * Przykład użycia serwisu OpenRouterService
 */

import { OpenRouterService } from "../services/openrouter.service";

/**
 * Przykład podstawowego użycia OpenRouterService
 */
async function basicExample(): Promise<void> {
  // Inicjalizacja serwisu z kluczem API
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required in environment variables");
  }

  const router = new OpenRouterService({
    apiKey,
    defaultModel: "openai/gpt-4o-mini",
    defaultParams: { temperature: 0.7, max_tokens: 150 },
  });

  try {
    // Wysłanie prostego zapytania
    const result = await router.sendMessage({
      systemMessage: "You are a helpful assistant.",
      userMessage: "Opowiedz dowcip o kotach.",
    });

    console.log("Odpowiedź:", result);
  } catch (error) {
    console.error("Błąd:", error);
  }
}

/**
 * Przykład użycia z walidacją JSON schema
 */
async function jsonSchemaExample(): Promise<void> {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required in environment variables");
  }

  const router = new OpenRouterService({
    apiKey,
    defaultModel: "openai/gpt-4o-mini",
  });

  try {
    // Simplified format to match OpenAI API spec
    const result = await router.sendMessage({
      systemMessage: "You are a helpful assistant that returns structured data as JSON.",
      userMessage:
        "Generate a joke about cats and return it in JSON format with these exact fields: joke (string), category (string), and rating (number from 1-10).",
      responseFormat: {
        type: "json_schema",
        json_schema: {
          name: "JokeResponse",
          strict: true,
          schema: {
            type: "object",
            properties: {
              joke: { type: "string" },
              category: { type: "string" },
              rating: { type: "number" },
            },
            required: ["joke", "category", "rating"],
          },
        },
      },
    });

    console.log("Full result:", JSON.stringify(result, null, 2));

    // Typowanie wynikowej odpowiedzi
    const typedResult = result as { joke: string; category: string; rating: number };
    console.log("Żart:", typedResult.joke);
    console.log("Kategoria:", typedResult.category);
    console.log("Ocena:", typedResult.rating);
  } catch (error) {
    console.error("Błąd podczas wykonania żądania:", error);
    if (error instanceof Error) {
      console.error("Komunikat błędu:", error.message);
      console.error("Stack trace:", error.stack);
    }
  }
}

/**
 * Przykład złożonego schematu JSON
 */
async function complexSchemaExample(): Promise<void> {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required in environment variables");
  }

  const router = new OpenRouterService({
    apiKey,
    defaultModel: "openai/gpt-4o-mini",
  });

  try {
    // Definicja złożonego schematu JSON
    const result = await router.sendMessage({
      systemMessage: "You are a helpful assistant that returns structured data as requested.",
      userMessage:
        "Generate a list of 3 tasks to do today. Each task must include title, description, priority, and estimated_minutes. Also include metadata with created_at and total_tasks.",
      responseFormat: {
        type: "json_schema",
        json_schema: {
          name: "TodoListResponse",
          strict: true,
          schema: {
            type: "object",
            properties: {
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    priority: { type: "string" },
                    estimated_minutes: { type: "number" },
                  },
                  required: ["title", "description", "priority", "estimated_minutes"],
                },
              },
              metadata: {
                type: "object",
                properties: {
                  created_at: { type: "string" },
                  total_tasks: { type: "number" },
                },
                required: ["created_at", "total_tasks"],
              },
            },
            required: ["tasks", "metadata"],
          },
        },
      },
    });

    // Typowanie wynikowej odpowiedzi ze złożonym schematem
    interface Task {
      title: string;
      description: string;
      priority: string;
      estimated_minutes: number;
    }

    interface TodoListResponse {
      tasks: Task[];
      metadata: {
        created_at: string;
        total_tasks: number;
      };
    }

    // Dodaję jawne rzutowanie przez unknown, aby uniknąć błędu typowania
    const typedResult = result as unknown as TodoListResponse;
    console.log("Lista zadań:", typedResult.tasks);
    console.log("Łączna liczba zadań:", typedResult.metadata.total_tasks);
    console.log("Data utworzenia:", typedResult.metadata.created_at);
  } catch (error) {
    console.error("Błąd:", error);
  }
}

// Export przykładów
export { basicExample, jsonSchemaExample, complexSchemaExample };

/**
 * Minimalny przykład testowy dla JSON format
 */
export async function minimalJsonTest(): Promise<void> {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required in environment variables");
  }

  const router = new OpenRouterService({
    apiKey,
    defaultModel: "openai/gpt-4o-mini",
  });

  try {
    // Super prosty przykład JSON
    const result = await router.sendMessage({
      systemMessage: "You are a helpful assistant that replies with JSON.",
      userMessage: "Return a simple JSON with fields: message (string).",
      responseFormat: {
        type: "json_schema",
        json_schema: {
          name: "SimpleResponse",
          strict: true,
          schema: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
            required: ["message"],
          },
        },
      },
    });

    console.log("Minimal JSON test result:", result);
  } catch (error) {
    console.error("Minimal test error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
  }
}
