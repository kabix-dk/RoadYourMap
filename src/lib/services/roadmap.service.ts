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
    const response = await fetch("/api/roadmaps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const error = await response.json();
        throw new RoadmapError(error.message || "Błąd walidacji danych.", 400);
      }
      if (response.status === 401) {
        throw new RoadmapError("Musisz być zalogowany, aby utworzyć roadmapę.", 401);
      }
      if (response.status === 429) {
        throw new RoadmapError("Osiągnięto limit 5 roadmap. Nie można utworzyć nowej.", 429);
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
      throw new RoadmapError("Brak połączenia z internetem. Sprawdź swoje połączenie i spróbuj ponownie.");
    }
    throw new RoadmapError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.");
  }
}
