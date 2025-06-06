import React from "react";
import type { RoadmapDetailsDto } from "@/types";

interface RoadmapHeaderProps {
  roadmap: Pick<RoadmapDetailsDto, "title" | "technology" | "experience_level">;
}

const RoadmapHeader: React.FC<RoadmapHeaderProps> = ({ roadmap }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">{roadmap.title}</h1>
      <div className="flex gap-4 text-blue-200">
        {roadmap.technology && (
          <span className="bg-blue-600/20 px-3 py-1 rounded-full text-sm">{roadmap.technology}</span>
        )}
        {roadmap.experience_level && (
          <span className="bg-purple-600/20 px-3 py-1 rounded-full text-sm">{roadmap.experience_level}</span>
        )}
      </div>
    </div>
  );
};

export default RoadmapHeader;
