import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoadmapItemViewModel } from "@/types/viewModels";
import { InlineTextEdit } from "./InlineTextEdit";

interface RoadmapItemNodeProps {
  item: RoadmapItemViewModel;
  onTitleUpdate: (itemId: string, newTitle: string) => void;
  onDescriptionUpdate: (itemId: string, newDescription: string) => void;
  onToggleExpand: (itemId: string) => void;
  path: string;
  isActive?: boolean;
}

export function RoadmapItemNode({
  item,
  onTitleUpdate,
  onDescriptionUpdate,
  onToggleExpand,
  path,
  isActive = false,
}: RoadmapItemNodeProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: {
      type: "roadmap-item",
      path,
      parentId: item.parentId,
    },
    animateLayoutChanges: () => true,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: [
      transition,
      // Add custom transitions for smooth animations
      "background-color 150ms ease",
      "border-color 150ms ease",
      "margin 150ms ease",
      "opacity 150ms ease",
    ]
      .filter(Boolean)
      .join(", "),
  };

  const hasChildren = item.children.length > 0;
  const ChevronIcon = item.isExpanded ? ChevronDown : ChevronRight;

  const validateTitle = (value: string) => {
    if (!value.trim()) return "Title cannot be empty";
    if (value.length > 255) return "Title is too long (max 255 characters)";
    return null;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative pl-4 pt-2 transition-all duration-200 ease-in-out",
        isDragging && "opacity-50 z-50 shadow-lg",
        isActive && "bg-gray-50 dark:bg-gray-800/50",
        item.level > 0 && "ml-6 border-l border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="flex items-start gap-2 group">
        <button
          type="button"
          className={cn(
            "p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-grab active:cursor-grabbing",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          )}
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggleExpand(item.id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors duration-200"
            aria-expanded={item.isExpanded}
            aria-label={item.isExpanded ? "Collapse section" : "Expand section"}
          >
            <ChevronIcon className="w-4 h-4 transition-transform duration-200" />
          </button>
        )}

        <div className="flex-1 space-y-2">
          <InlineTextEdit
            initialValue={item.title}
            onSave={(newTitle) => onTitleUpdate(item.id, newTitle)}
            validate={validateTitle}
            className="font-medium text-gray-900 dark:text-white"
          />

          <InlineTextEdit
            initialValue={item.description || ""}
            onSave={(newDescription) => onDescriptionUpdate(item.id, newDescription)}
            multiline
            placeholder="Add a description..."
            className="text-sm text-gray-600 dark:text-gray-400"
          />
        </div>
      </div>

      <div
        className={cn(
          "mt-2 transition-all duration-200 ease-in-out",
          item.isExpanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
        )}
      >
        {item.isExpanded &&
          hasChildren &&
          item.children.map((child, index) => (
            <RoadmapItemNode
              key={child.id}
              item={child}
              onTitleUpdate={onTitleUpdate}
              onDescriptionUpdate={onDescriptionUpdate}
              onToggleExpand={onToggleExpand}
              path={`${path}.${index}`}
              isActive={isActive}
            />
          ))}
      </div>
    </div>
  );
}
