import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { RoadmapDetailsDto } from "@/types";
import type { RoadmapItemViewModel } from "@/components/views/RoadmapDetailsView.types";
import { buildRoadmapTree, calculateProgress, updateItemCompletionStatus } from "@/lib/roadmap-utils";

interface UseRoadmapDetailsReturn {
  roadmap: RoadmapDetailsDto | null;
  tree: RoadmapItemViewModel[];
  isLoading: boolean;
  error: string | null;
  progress: number;
  toggleItemCompletion: (itemId: string, isCompleted: boolean) => void;
}

export function useRoadmapDetails(roadmapId: string): UseRoadmapDetailsReturn {
  const [roadmap, setRoadmap] = useState<RoadmapDetailsDto | null>(null);
  const [tree, setTree] = useState<RoadmapItemViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Pobieranie danych roadmapy
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/roadmaps/${roadmapId}`);

        if (response.status === 401) {
          // Token wygasł - przekieruj do logowania
          window.location.href = "/auth/login";
          return;
        }

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Roadmapa nie została znaleziona");
          }
          throw new Error("Wystąpił błąd podczas pobierania roadmapy");
        }

        const data = await response.json();
        const roadmapData = data.roadmap as RoadmapDetailsDto;

        setRoadmap(roadmapData);

        // Przekształć płaską listę w drzewo
        const treeData = buildRoadmapTree(roadmapData.items);
        setTree(treeData);

        // Oblicz postęp
        const progressValue = calculateProgress(treeData);
        setProgress(progressValue);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (roadmapId) {
      fetchRoadmap();
    }
  }, [roadmapId]);

  // Funkcja do przełączania statusu ukończenia elementu
  const toggleItemCompletion = useCallback(
    async (itemId: string, isCompleted: boolean) => {
      if (!roadmap) return;

      // Optimistic update - natychmiast aktualizuj UI
      const previousTree = tree;
      const previousProgress = progress;

      const updatedTree = updateItemCompletionStatus(tree, itemId, isCompleted);
      const newProgress = calculateProgress(updatedTree);

      setTree(updatedTree);
      setProgress(newProgress);

      try {
        // Wyślij żądanie do API
        const response = await fetch(`/api/roadmaps/${roadmapId}/items/${itemId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_completed: isCompleted,
          }),
        });

        if (response.status === 401) {
          // Token wygasł - przekieruj do logowania
          window.location.href = "/auth/login";
          return;
        }

        if (!response.ok) {
          throw new Error("Nie udało się zaktualizować statusu elementu");
        }

        // Opcjonalnie: zaktualizuj dane z odpowiedzi serwera
        const updatedItem = await response.json();
        console.log("Element zaktualizowany:", updatedItem);

        // Wyświetl toast sukcesu
        toast.success(isCompleted ? "Element oznaczony jako ukończony" : "Element oznaczony jako nieukończony");
      } catch (err) {
        // Cofnij optimistic update w przypadku błędu
        setTree(previousTree);
        setProgress(previousProgress);

        const errorMessage = err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania";

        // Wyświetl toast z błędem
        toast.error(errorMessage);
        console.error("Błąd aktualizacji:", errorMessage);
      }
    },
    [roadmapId, roadmap, tree, progress]
  );

  return {
    roadmap,
    tree,
    isLoading,
    error,
    progress,
    toggleItemCompletion,
  };
}
