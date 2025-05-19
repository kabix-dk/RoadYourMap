import { useState, useCallback } from "react";
import type { RoadmapSummaryDto } from "../../types";
import { useRoadmaps } from "../../lib/hooks/useRoadmaps";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import RoadmapCard from "./RoadmapCard";
import { useNavigate } from "../../lib/hooks/useNavigate";

interface RoadmapToDelete {
  id: string;
  title: string;
}

export default function RoadmapListContainer() {
  const { roadmaps, isLoading, error, deleteRoadmapAndUpdateList } = useRoadmaps();
  const [roadmapToDelete, setRoadmapToDelete] = useState<RoadmapToDelete | null>(null);
  const navigate = useNavigate();

  const handlePreview = useCallback(
    (roadmapId: string) => {
      navigate(`/roadmaps/${roadmapId}`);
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (roadmapId: string) => {
      navigate(`/roadmaps/${roadmapId}/edit`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((roadmap: RoadmapSummaryDto) => {
    setRoadmapToDelete({ id: roadmap.id, title: roadmap.title });
  }, []);

  const handleDeleteConfirm = async () => {
    if (!roadmapToDelete) return;

    try {
      await deleteRoadmapAndUpdateList(roadmapToDelete.id);
      setRoadmapToDelete(null);
    } catch {
      // Error is already handled in useRoadmaps
      setRoadmapToDelete(null);
    }
  };

  const handleDeleteCancel = useCallback(() => {
    setRoadmapToDelete(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You don&apos;t have any roadmaps yet.</p>
        <a
          href="/roadmaps/create"
          className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Create Your First Roadmap
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roadmaps.map((roadmap) => (
          <RoadmapCard
            key={roadmap.id}
            roadmap={roadmap}
            onPreview={handlePreview}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      <DeleteConfirmationDialog
        isOpen={roadmapToDelete !== null}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        roadmapTitle={roadmapToDelete?.title || ""}
      />
    </>
  );
}
