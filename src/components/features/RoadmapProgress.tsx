import React from "react";
import { Progress } from "@/components/ui/progress";

interface RoadmapProgressProps {
  value: number;
}

const RoadmapProgress: React.FC<RoadmapProgressProps> = ({ value }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-white font-medium">Postęp ukończenia</span>
        <span className="text-blue-200 text-sm">{Math.round(value)}%</span>
      </div>
      <Progress value={value} className="h-3 bg-white/10" />
    </div>
  );
};

export default RoadmapProgress;
