import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { InlineEditor } from "./InlineEditor";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import type { RoadmapItemViewModel } from "./types";

interface RoadmapItemProps {
  item: RoadmapItemViewModel;
  onUpdate: (itemId: string, updates: { title?: string; description?: string; is_completed?: boolean }) => void;
  onDelete: (itemId: string) => void;
  onAdd: (parentId: string) => void;
  isLoading?: boolean;
}

export function RoadmapItem({ item, onUpdate, onDelete, onAdd, isLoading = false }: RoadmapItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const handleTitleUpdate = (newTitle: string) => {
    onUpdate(item.id, { title: newTitle });
  };

  const handleDescriptionUpdate = (newDescription: string) => {
    onUpdate(item.id, { description: newDescription });
  };

  const handleCompletedChange = (checked: boolean) => {
    onUpdate(item.id, { is_completed: checked });
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(item.id);
    setShowDeleteDialog(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  const handleAddChild = () => {
    onAdd(item.id);
  };

  // Określ kolor na podstawie poziomu zagnieżdżenia
  const getLevelStyles = (level: number) => {
    switch (level) {
      case 1:
        return "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20";
      case 2:
        return "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20";
      case 3:
        return "border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950/20";
      default:
        return "border-l-4 border-l-gray-500 bg-gray-50 dark:bg-gray-950/20";
    }
  };

  const itemContent = (
    <div
      className={`roadmap-item p-4 rounded-lg ${getLevelStyles(item.level)} ${item.is_completed ? "opacity-75" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="drag-handle cursor-grab active:cursor-grabbing mt-1">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* Checkbox */}
        <div className="mt-1">
          <Checkbox checked={item.is_completed} onCheckedChange={handleCompletedChange} disabled={isLoading} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className={`mb-2 ${item.is_completed ? "line-through text-gray-500" : ""}`}>
            <InlineEditor
              value={item.title}
              onSave={handleTitleUpdate}
              fieldName="title"
              placeholder="Wprowadź tytuł..."
              className="text-lg font-semibold"
            />
          </div>

          {/* Description */}
          {(item.description || !item.is_completed) && (
            <div
              className={`mb-3 ${item.is_completed ? "line-through text-gray-500" : "text-gray-600 dark:text-gray-300"}`}
            >
              <InlineEditor
                value={item.description || ""}
                onSave={handleDescriptionUpdate}
                fieldName="description"
                multiline
                placeholder="Dodaj opis..."
                className="text-sm"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddChild}
              disabled={isLoading || item.level >= 3}
              className="h-7 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Dodaj
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleDeleteClick}
              disabled={isLoading}
              className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Usuń
            </Button>

            {item.completed_at && (
              <span className="text-xs text-gray-500 ml-auto">
                Ukończono: {new Date(item.completed_at).toLocaleDateString("pl-PL")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && (
        <div className="mt-4 ml-7 space-y-2">
          {item.children.map((child) => (
            <RoadmapItem
              key={child.id}
              item={child}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAdd={onAdd}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Jeśli element ma dzieci i jest na poziomie 1, owijamy w Accordion
  if (hasChildren && item.level === 1) {
    return (
      <>
        <Accordion type="single" collapsible defaultValue={item.id}>
          <AccordionItem value={item.id} className="border-none">
            <div
              className={`roadmap-item p-4 rounded-lg ${getLevelStyles(item.level)} ${item.is_completed ? "opacity-75" : ""}`}
            >
              <div className="flex items-start gap-3">
                {/* Drag Handle */}
                <div className="drag-handle cursor-grab active:cursor-grabbing mt-1">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>

                {/* Checkbox */}
                <div className="mt-1">
                  <Checkbox checked={item.is_completed} onCheckedChange={handleCompletedChange} disabled={isLoading} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title with Accordion Trigger */}
                  <div className={`mb-2 ${item.is_completed ? "line-through text-gray-500" : ""}`}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <InlineEditor
                          value={item.title}
                          onSave={handleTitleUpdate}
                          fieldName="title"
                          placeholder="Wprowadź tytuł..."
                          className="text-lg font-semibold"
                        />
                      </div>
                      <AccordionTrigger className="hover:no-underline p-1 h-auto w-auto [&[data-state=open]>svg]:rotate-180">
                        <span className="sr-only">Rozwiń/Zwiń sekcję</span>
                      </AccordionTrigger>
                    </div>
                  </div>

                  {/* Description */}
                  {(item.description || !item.is_completed) && (
                    <div
                      className={`mb-3 ${item.is_completed ? "line-through text-gray-500" : "text-gray-600 dark:text-gray-300"}`}
                    >
                      <InlineEditor
                        value={item.description || ""}
                        onSave={handleDescriptionUpdate}
                        fieldName="description"
                        multiline
                        placeholder="Dodaj opis..."
                        className="text-sm"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddChild}
                      disabled={isLoading || item.level >= 3}
                      className="h-7 px-2 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Dodaj
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDeleteClick}
                      disabled={isLoading}
                      className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Usuń
                    </Button>

                    {item.completed_at && (
                      <span className="text-xs text-gray-500 ml-auto">
                        Ukończono: {new Date(item.completed_at).toLocaleDateString("pl-PL")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <AccordionContent className="pb-0 pt-2">
              <div className="ml-7 space-y-2">
                {item.children.map((child) => (
                  <RoadmapItem
                    key={child.id}
                    item={child}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onAdd={onAdd}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <ConfirmDeleteDialog
          isOpen={showDeleteDialog}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          itemTitle={item.title}
          hasChildren={hasChildren}
          isLoading={isLoading}
        />
      </>
    );
  }

  return (
    <>
      {itemContent}
      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemTitle={item.title}
        hasChildren={hasChildren}
        isLoading={isLoading}
      />
    </>
  );
}
