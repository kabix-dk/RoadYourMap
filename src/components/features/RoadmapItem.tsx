import React from "react";
import type { RoadmapItemViewModel } from "@/components/views/RoadmapDetailsView.types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import RoadmapItemsList from "./RoadmapItemsList";

interface RoadmapItemProps {
  item: RoadmapItemViewModel;
  onToggleComplete: (itemId: string, isCompleted: boolean) => void;
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({ item, onToggleComplete }) => {
  const hasChildren = item.children && item.children.length > 0;

  const handleCheckboxChange = (checked: boolean) => {
    onToggleComplete(item.id, checked);
  };

  const itemContent = (
    <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
      <Checkbox
        id={`item-${item.id}`}
        checked={item.is_completed}
        onCheckedChange={handleCheckboxChange}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <label
          htmlFor={`item-${item.id}`}
          className={`block font-medium cursor-pointer ${
            item.is_completed ? "text-green-300 line-through" : "text-white"
          }`}
        >
          {item.title}
        </label>
        {item.description && (
          <p className={`mt-1 text-sm ${item.is_completed ? "text-green-200/70" : "text-white/70"}`}>
            {item.description}
          </p>
        )}
        {item.completed_at && (
          <p className="mt-1 text-xs text-green-400">
            Ukończono: {new Date(item.completed_at).toLocaleDateString("pl-PL")}
          </p>
        )}
      </div>
    </div>
  );

  if (!hasChildren) {
    return itemContent;
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={item.id} className="border-white/10">
        <AccordionTrigger className="hover:no-underline p-0 [&[data-state=open]>div]:mb-2">
          {itemContent}
        </AccordionTrigger>
        <AccordionContent className="pt-2 pb-2">
          <div className="ml-6 border-l-2 border-white/10 pl-4 space-y-2">
            <RoadmapItemsList items={item.children} onToggleComplete={onToggleComplete} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default RoadmapItem;
