import type { APIRoute } from "astro";
import {
  basicExample,
  complexSchemaExample,
  jsonSchemaExample,
  minimalJsonTest,
} from "../../../lib/utils/openrouter.example";

export const POST: APIRoute = async () => {
  // Sprawdzenie, czy klucz API jest skonfigurowany
  if (!import.meta.env.OPENROUTER_API_KEY) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "OPENROUTER_API_KEY is not configured. Please add it to your .env file:",
        instructions: [
          "1. Create or edit .env file in the root directory",
          "2. Add the following line: OPENROUTER_API_KEY=your_api_key_here",
          "3. Restart the development server",
        ],
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    // Wywołaj przykładową funkcję
    await basicExample();
    // await jsonSchemaExample();
    // await complexSchemaExample();
    // await minimalJsonTest();

    return new Response(
      JSON.stringify({
        success: true,
        message: "OpenRouter example executed successfully. Check server logs for output.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error executing OpenRouter example:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
