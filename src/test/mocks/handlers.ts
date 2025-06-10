import { http, HttpResponse } from "msw";

export const handlers = [
  // Przykładowy handler dla API
  http.get("/api/example", () => {
    return HttpResponse.json({
      message: "Hello from mocked API",
    });
  }),

  // Handler dla Supabase auth
  http.post("*/auth/v1/token", () => {
    return HttpResponse.json({
      access_token: "mock-token",
      token_type: "bearer",
      expires_in: 3600,
      user: {
        id: "mock-user-id",
        email: "test@example.com",
      },
    });
  }),
];
