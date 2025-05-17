import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface BaseInlineTextEditProps {
  initialValue: string;
  onSave: (newValue: string) => void;
  validate?: (value: string) => string | null;
  placeholder?: string;
  className?: string;
}

function SingleLineEdit({ initialValue, onSave, validate, placeholder, className }: BaseInlineTextEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setError(null);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      if (error) setError(null);
    },
    [error]
  );

  const handleSave = useCallback(() => {
    if (validate) {
      const validationError = validate(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    onSave(value);
    setIsEditing(false);
    setError(null);
  }, [value, validate, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        setIsEditing(false);
        setValue(initialValue);
        setError(null);
      }
    },
    [handleSave, initialValue]
  );

  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  if (isEditing) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          placeholder={placeholder}
        />
        {error && (
          <p className="text-sm text-red-500 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleStartEdit}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full text-left px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
        !value && "text-gray-500 italic",
        className
      )}
      aria-label="Edit title"
    >
      {value || placeholder}
    </button>
  );
}

function MultiLineEdit({ initialValue, onSave, validate, placeholder, className }: BaseInlineTextEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setError(null);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
      if (error) setError(null);
    },
    [error]
  );

  const handleSave = useCallback(() => {
    if (validate) {
      const validationError = validate(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    onSave(value);
    setIsEditing(false);
    setError(null);
  }, [value, validate, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && e.shiftKey) {
        return; // Allow newlines with Shift+Enter
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        setIsEditing(false);
        setValue(initialValue);
        setError(null);
      }
    },
    [handleSave, initialValue]
  );

  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  if (isEditing) {
    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "min-h-[100px] resize-y",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          placeholder={placeholder}
        />
        {error && (
          <p className="text-sm text-red-500 mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleStartEdit}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full text-left px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
        !value && "text-gray-500 italic",
        className
      )}
      aria-label="Edit description"
    >
      {value || placeholder}
    </button>
  );
}

interface InlineTextEditProps extends BaseInlineTextEditProps {
  multiline?: boolean;
}

export function InlineTextEdit({ multiline = false, ...props }: InlineTextEditProps) {
  return multiline ? <MultiLineEdit {...props} /> : <SingleLineEdit {...props} />;
}
