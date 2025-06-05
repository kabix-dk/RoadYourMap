import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { resetPasswordSchema } from "../../../lib/auth/validation";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Nieprawidłowe dane wejściowe",
            details: validationResult.error.errors,
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { password } = validationResult.data;

    // Create Supabase server instance
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Update user password using Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      let errorMessage = "Wystąpił błąd podczas resetowania hasła";

      if (error.message.includes("session")) {
        errorMessage = "Sesja wygasła. Spróbuj ponownie z nowym linkiem resetującym";
      } else if (error.message.includes("password")) {
        errorMessage = "Hasło nie spełnia wymagań bezpieczeństwa";
      }

      return new Response(
        JSON.stringify({
          error: {
            message: errorMessage,
            code: "PASSWORD_RESET_FAILED",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Hasło zostało pomyślnie zresetowane",
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: "Wystąpił błąd serwera",
          code: "INTERNAL_SERVER_ERROR",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
