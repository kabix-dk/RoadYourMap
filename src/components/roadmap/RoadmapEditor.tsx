import React, { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { RoadmapTree } from "./RoadmapTree";
import { useRoadmapEditor } from "./useRoadmapEditor";
import type { RoadmapDetailsDto } from "@/types";

interface RoadmapEditorProps {
  roadmapId: string;
}

export function RoadmapEditor({ roadmapId }: RoadmapEditorProps) {
  const [initialData, setInitialData] = useState<RoadmapDetailsDto | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Pobierz dane roadmapy
  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setIsLoadingData(true);
        setLoadError(null);

        const response = await fetch(`/api/roadmaps/${roadmapId}`);

        if (response.status === 401) {
          window.location.href = "/auth/login";
          return;
        }

        if (response.status === 404) {
          setLoadError("Roadmapa nie została znaleziona");
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        setInitialData(responseData.roadmap);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd";
        setLoadError(errorMessage);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (roadmapId) {
      fetchRoadmap();
    }
  }, [roadmapId]);

  // Stan ładowania danych
  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Spinner className="mx-auto mb-4" />
          <p className="text-blue-200">Ładowanie roadmapy...</p>
        </div>
      </div>
    );
  }

  // Stan błędu ładowania
  if (loadError || !initialData) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-200">Błąd ładowania roadmapy</h3>
            <div className="mt-2 text-sm text-red-300">
              <p>{loadError || "Nie udało się załadować roadmapy"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Jeśli dane nie są jeszcze załadowane, nie renderujemy głównej części
  if (!initialData) {
    return null;
  }

  return <RoadmapEditorContent initialData={initialData} />;
}

// Oddzielny komponent dla głównej logiki edytora
function RoadmapEditorContent({ initialData }: { initialData: RoadmapDetailsDto }) {
  const { flatItems, nestedItems, isLoading, error, actions } = useRoadmapEditor(initialData);

  // Obsługa dodawania nowego elementu
  const handleAdd = async (parentId?: string) => {
    const defaultTitle = parentId ? "Nowy element" : "Nowy rozdział";
    await actions.addItem({
      parent_item_id: parentId,
      title: defaultTitle,
      description: "",
    });
  };

  // Obsługa aktualizacji elementu
  const handleUpdate = async (
    itemId: string,
    updates: { title?: string; description?: string; is_completed?: boolean }
  ) => {
    await actions.updateItem(itemId, updates);
  };

  // Obsługa usuwania elementu
  const handleDelete = async (itemId: string) => {
    await actions.deleteItem(itemId);
  };

  // Obsługa zmiany kolejności
  const handleMoveItem = async (itemId: string, direction: "up" | "down") => {
    await actions.moveItem(itemId, direction);
  };

  // Stan ładowania
  if (isLoading && flatItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Spinner className="mx-auto mb-4" />
          <p className="text-blue-200">Ładowanie roadmapy...</p>
        </div>
      </div>
    );
  }

  // Stan błędu
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-200">Wystąpił błąd</h3>
            <div className="mt-2 text-sm text-red-300">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="roadmap-editor">
      {/* Header z informacjami o roadmapie */}
      <div className="mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{initialData.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-blue-200">
              <span>
                <strong>Technologia:</strong> {initialData.technology}
              </span>
              <span>
                <strong>Poziom:</strong> {initialData.experience_level}
              </span>
              <span>
                <strong>Elementy:</strong> {flatItems.length}
              </span>
            </div>
            {initialData.goals && (
              <div className="mt-3">
                <p className="text-sm text-blue-100">
                  <strong>Cele:</strong> {initialData.goals}
                </p>
              </div>
            )}
          </div>

          {/* Wskaźnik ładowania */}
          {isLoading && (
            <div className="flex items-center text-sm text-blue-300">
              <Spinner className="mr-2 h-4 w-4" />
              Zapisywanie...
            </div>
          )}
        </div>
      </div>

      {/* Główny obszar edycji */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
        <div className="p-6">
          <RoadmapTree
            items={nestedItems}
            onMoveItem={handleMoveItem}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAdd={handleAdd}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Informacje pomocnicze */}
      <div className="mt-6 text-sm">
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="font-medium text-blue-200 mb-2">💡 Wskazówki:</h4>
          <ul className="space-y-1 text-blue-100">
            <li>• Kliknij na tytuł lub opis, aby edytować tekst</li>
            <li>• Użyj strzałek, aby zmienić kolejność elementów</li>
            <li>• Użyj checkboxa, aby oznaczyć element jako ukończony</li>
            <li>• Wszystkie zmiany są automatycznie zapisywane</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
