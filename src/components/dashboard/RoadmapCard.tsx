import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import type { RoadmapSummaryWithProgressDto } from "../../types";

interface RoadmapCardProps {
  roadmap: RoadmapSummaryWithProgressDto;
  onPreview: (roadmapId: string) => void;
  onEdit: (roadmapId: string) => void;
  onDelete: (roadmap: RoadmapSummaryWithProgressDto) => void;
}

export default function RoadmapCard({ roadmap, onPreview, onEdit, onDelete }: RoadmapCardProps) {
  const formattedDate = new Date(roadmap.created_at).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Use the actual progress calculated by the backend, rounded to whole number
  const progressPercentage = Math.round(roadmap.progress);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{roadmap.title}</CardTitle>
        <div className="text-sm text-muted-foreground">Utworzono: {formattedDate}</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-1">Postęp</div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">{progressPercentage}% ukończone</div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Technologia:</span>
              <div className="text-muted-foreground">{roadmap.technology}</div>
            </div>
            <div>
              <span className="font-medium">Poziom:</span>
              <div className="text-muted-foreground">{roadmap.experience_level}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="default" size="sm" onClick={() => onPreview(roadmap.id)} className="cursor-pointer">
          Podgląd
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(roadmap.id)} className="cursor-pointer">
          Edytuj
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(roadmap)} className="cursor-pointer">
          Usuń
        </Button>
      </CardFooter>
    </Card>
  );
}
