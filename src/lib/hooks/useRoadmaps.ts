import { useState, useEffect } from "react";
import type { RoadmapSummaryDto } from "../../types";

interface UseRoadmapsReturn {
  roadmaps: RoadmapSummaryDto[];
  isLoading: boolean;
  error: string | null;
  fetchRoadmaps: () => Promise<void>;
  deleteRoadmapAndUpdateList: (roadmapId: string) => Promise<void>;
}

export function useRoadmaps(): UseRoadmapsReturn {
  const [roadmaps, setRoadmaps] = useState<RoadmapSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmaps = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/roadmaps", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch roadmaps");
      }

      const data = await response.json();
      // Update to match the actual API response structure
      setRoadmaps(data.roadmaps || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching roadmaps");
      console.error("Error fetching roadmaps:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to fetch roadmaps when the component mounts
  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const deleteRoadmapAndUpdateList = async (roadmapId: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/roadmaps/${roadmapId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete roadmap");
      }

      // Update local state by removing the deleted roadmap
      setRoadmaps((prevRoadmaps) => prevRoadmaps.filter((roadmap) => roadmap.id !== roadmapId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while deleting roadmap");
      console.error("Error deleting roadmap:", err);
      throw err; // Re-throw to handle in the component
    }
  };

  return {
    roadmaps,
    isLoading,
    error,
    fetchRoadmaps,
    deleteRoadmapAndUpdateList,
  };
}
