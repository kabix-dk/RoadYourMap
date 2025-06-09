import React, { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, X, Edit } from "lucide-react";

interface InlineEditorProps {
  value: string;
  onSave: (newValue: string) => void;
  fieldName: string;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}

export function InlineEditor({
  value,
  onSave,
  fieldName,
  multiline = false,
  placeholder,
  className = "",
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [inputElement, setInputElement] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Callback ref function
  const inputRef = useCallback((node: HTMLInputElement | HTMLTextAreaElement | null) => {
    setInputElement(node);
  }, []);

  // Aktualizuj wartość edycji gdy zmieni się prop value
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Focus na input gdy wchodzimy w tryb edycji
  useEffect(() => {
    if (isEditing && inputElement) {
      inputElement.focus();
      inputElement.select();
    }
  }, [isEditing, inputElement]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();

    // Walidacja - title nie może być pusty
    if (fieldName === "title" && !trimmedValue) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(trimmedValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving:", error);
      // Błąd zostanie obsłużony przez hook useRoadmapEditor
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const isValid = fieldName !== "title" || editValue.trim().length > 0;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleStartEdit();
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input;

    return (
      <div className={`inline-editor-container ${className}`}>
        <div className="flex items-start gap-2">
          <InputComponent
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`flex-1 ${!isValid ? "border-red-500" : ""}`}
            disabled={isLoading}
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              disabled={!isValid || isLoading}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel} disabled={isLoading} className="h-8 w-8 p-0">
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
        {!isValid && (
          <p className="text-sm text-red-600 mt-1">
            {fieldName === "title" ? "Tytuł nie może być pusty" : "Nieprawidłowa wartość"}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-editor-display group cursor-pointer ${className}`}
      onClick={handleStartEdit}
      onKeyDown={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={`Edytuj ${fieldName}`}
    >
      <div className="flex items-center gap-2">
        {multiline ? (
          <div className="flex-1 whitespace-pre-wrap">
            {value || <span className="text-gray-400">{placeholder || "Kliknij aby edytować"}</span>}
          </div>
        ) : (
          <span className="flex-1">
            {value || <span className="text-gray-400">{placeholder || "Kliknij aby edytować"}</span>}
          </span>
        )}
        <Edit className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
