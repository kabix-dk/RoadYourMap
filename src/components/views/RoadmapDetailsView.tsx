import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { useRoadmapDetails } from "@/components/hooks/useRoadmapDetails";
import RoadmapHeader from "@/components/features/RoadmapHeader";
import RoadmapProgress from "@/components/features/RoadmapProgress";
import RoadmapItemsList from "@/components/features/RoadmapItemsList";

interface RoadmapDetailsViewProps {
  roadmapId: string;
}

const RoadmapDetailsView: React.FC<RoadmapDetailsViewProps> = ({ roadmapId }) => {
  const { roadmap, tree, isLoading, error, progress, toggleItemCompletion } = useRoadmapDetails(roadmapId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <span className="ml-4 text-white text-lg">Ładowanie roadmapy...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 shadow-xl">
            <div className="text-center py-12">
              <div className="text-red-400 text-xl mb-4">Wystąpił błąd</div>
              <p className="text-white mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Odśwież stronę
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 shadow-xl">
            <div className="text-center py-12">
              <div className="text-white text-xl">Roadmapa nie została znaleziona</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <RoadmapHeader roadmap={roadmap} />
              <div className="flex gap-4">
                <a
                  href="/dashboard"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  ← Dashboard
                </a>
                <button
                  onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => (window.location.href = "/"))}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Wyloguj się
                </button>
              </div>
            </div>

            <div className="mb-6">
              <RoadmapProgress value={progress} />
            </div>

            <div className="max-w-4xl mx-auto">
              <RoadmapItemsList items={tree} onToggleComplete={toggleItemCompletion} />
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default RoadmapDetailsView;
