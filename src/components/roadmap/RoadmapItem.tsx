import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { InlineEditor } from "./InlineEditor";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import type { RoadmapItemViewModel } from "./types";

interface RoadmapItemProps {
  item: RoadmapItemViewModel;
  onUpdate: (itemId: string, updates: { title?: string; description?: string; is_completed?: boolean }) => void;
  onDelete: (itemId: string) => void;
  onAdd: (parentId?: string) => void;
  onMoveItem: (itemId: string, direction: "up" | "down") => void;
  isLoading?: boolean;
  itemIndex: number;
  totalItems: number;
}

export function RoadmapItem({
  item,
  onUpdate,
  onDelete,
  onAdd,
  onMoveItem,
  isLoading = false,
  itemIndex,
  totalItems,
}: RoadmapItemProps) {
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

  const renderMoveButtons = () => (
    <div className="flex flex-col items-center justify-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onMoveItem(item.id, "up")}
        disabled={isLoading || itemIndex === 0}
        className="h-6 w-6 cursor-pointer"
      >
        <ArrowUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="sr-only">Przesuń w górę</span>
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onMoveItem(item.id, "down")}
        disabled={isLoading || itemIndex === totalItems - 1}
        className="h-6 w-6 cursor-pointer"
      >
        <ArrowDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="sr-only">Przesuń w dół</span>
      </Button>
    </div>
  );

  const renderItemContent = () => (
    <div className="flex items-start gap-3">
      {renderMoveButtons()}

      {/* Checkbox */}
      <div className="mt-1">
        <Checkbox checked={item.is_completed} onCheckedChange={handleCompletedChange} disabled={isLoading} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <div className={`mb-2 text-gray-900 dark:text-white ${item.is_completed ? "line-through" : ""}`}>
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
            className={`mb-3 ${item.is_completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-600 dark:text-gray-300"}`}
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
            variant="default"
            onClick={handleAddChild}
            disabled={isLoading || item.level >= 3}
            className="h-7 px-2 text-xs bg-gray-800 hover:bg-gray-900 text-white cursor-pointer"
          >
            <Plus className="h-3 w-3 mr-1" />
            Dodaj
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
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
  );

  const renderChildren = () => {
    if (!hasChildren) return null;

    return (
      <div className="mt-4 ml-7">
        <div className="space-y-2">
          {item.children.map((child, index) => (
            <RoadmapItem
              key={child.id}
              item={child}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAdd={onAdd}
              onMoveItem={onMoveItem}
              isLoading={isLoading}
              itemIndex={index}
              totalItems={item.children.length}
            />
          ))}
        </div>
      </div>
    );
  };

  const itemContent = (
    <div
      className={`roadmap-item p-4 rounded-lg ${getLevelStyles(item.level)} ${item.is_completed ? "opacity-75" : ""}`}
    >
      {renderItemContent()}
      {renderChildren()}
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
                {renderMoveButtons()}

                {/* Checkbox */}
                <div className="mt-1">
                  <Checkbox checked={item.is_completed} onCheckedChange={handleCompletedChange} disabled={isLoading} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title with Accordion Trigger */}
                  <div
                    className={`mb-2 text-gray-900 dark:text-white ${item.is_completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}
                  >
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
                      className={`mb-3 ${item.is_completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-600 dark:text-gray-300"}`}
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
                      variant="default"
                      onClick={handleAddChild}
                      disabled={isLoading || item.level >= 3}
                      className="h-7 px-2 text-xs bg-gray-800 hover:bg-gray-900 text-white cursor-pointer"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Dodaj
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDeleteClick}
                      disabled={isLoading}
                      className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
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

              {/* Children w Accordion Content */}
              <AccordionContent>{renderChildren()}</AccordionContent>
            </div>
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
