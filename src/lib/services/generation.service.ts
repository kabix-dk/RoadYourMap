import type { CreateRoadmapCommand, RoadmapDetailsDto } from "@/types";

export class RoadmapError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "RoadmapError";
  }
}

export async function generateRoadmap(data: CreateRoadmapCommand): Promise<RoadmapDetailsDto> {
  try {
    const response = await fetch("/api/roadmaps/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 302) {
        throw new RoadmapError("Musisz być zalogowany, aby utworzyć roadmapę.", 401);
      }
      if (response.status === 400) {
        const error = await response.json();
        if (error.error === "User has reached max roadmaps") {
          throw new RoadmapError("User has reached max roadmaps", 400);
        }
        throw new RoadmapError(error.message || "Błąd walidacji danych.", 400);
      }
      if (response.status === 401) {
        throw new RoadmapError("Musisz być zalogowany, aby utworzyć roadmapę.", 401);
      }
      if (response.status === 429) {
        throw new RoadmapError("User has reached max roadmaps", 429);
      }
      if (response.status === 502) {
        throw new RoadmapError("Błąd usługi generowania roadmapy. Spróbuj ponownie później.", 502);
      }
      throw new RoadmapError("Wystąpił nieoczekiwany błąd serwera. Spróbuj ponownie później.", 500);
    }

    const { roadmap } = await response.json();
    return roadmap;
  } catch (error) {
    if (error instanceof RoadmapError) {
      throw error;
    }
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new RoadmapError("Wystąpił nieoczekiwany błąd połączenia. Sprawdź swoje połączenie i spróbuj ponownie.");
    }
    throw new RoadmapError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
  }
}
