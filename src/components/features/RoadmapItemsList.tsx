import React from "react";
import type { RoadmapItemViewModel } from "@/components/views/RoadmapDetailsView.types";
import RoadmapItem from "./RoadmapItem";

interface RoadmapItemsListProps {
  items: RoadmapItemViewModel[];
  onToggleComplete: (itemId: string, isCompleted: boolean) => void;
}

const RoadmapItemsList: React.FC<RoadmapItemsListProps> = ({ items, onToggleComplete }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">Brak elementów w roadmapie</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <RoadmapItem key={item.id} item={item} onToggleComplete={onToggleComplete} />
      ))}
    </div>
  );
};

export default RoadmapItemsList;
