import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import type { RoadmapSummaryDto } from "../../types";

interface RoadmapCardProps {
  roadmap: RoadmapSummaryDto;
  onPreview: (roadmapId: string) => void;
  onEdit: (roadmapId: string) => void;
  onDelete: (roadmap: RoadmapSummaryDto) => void;
}

export default function RoadmapCard({ roadmap, onPreview, onEdit, onDelete }: RoadmapCardProps) {
  const formattedDate = new Date(roadmap.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // TODO: Replace with actual progress calculation once backend provides it
  const progressPercentage = 69;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{roadmap.title}</CardTitle>
        <div className="text-sm text-muted-foreground">Created: {formattedDate}</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-1">Progress</div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">{progressPercentage}% Complete</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Technology:</span>
              <div className="text-muted-foreground">{roadmap.technology}</div>
            </div>
            <div>
              <span className="font-medium">Level:</span>
              <div className="text-muted-foreground">{roadmap.experience_level}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="default" size="sm" onClick={() => onPreview(roadmap.id)} className="cursor-pointer">
          Preview
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(roadmap.id)} className="cursor-pointer">
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(roadmap)} className="cursor-pointer">
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
