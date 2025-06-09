import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemTitle: string;
  hasChildren?: boolean;
  isLoading?: boolean;
}

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  itemTitle,
  hasChildren = false,
  isLoading = false,
}: ConfirmDeleteDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Potwierdź usunięcie
          </DialogTitle>
          <DialogDescription className="text-left">
            Czy na pewno chcesz usunąć element <strong>&ldquo;{itemTitle}&rdquo;</strong>?
            {hasChildren && (
              <span className="block mt-2 text-red-600 font-medium">
                ⚠️ Uwaga: Zostaną również usunięte wszystkie elementy podrzędne.
              </span>
            )}
            <span className="block mt-2 text-gray-600">Ta operacja jest nieodwracalna.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Anuluj
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Usuwanie..." : "Usuń"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
