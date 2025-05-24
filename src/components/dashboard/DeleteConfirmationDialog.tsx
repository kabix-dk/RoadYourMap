import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roadmapTitle: string;
}

export default function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  roadmapTitle,
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/95 border-gray-700/50 backdrop-blur-lg shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-red-400 text-xl font-bold">Usuń roadmapę</DialogTitle>
          <DialogDescription className="text-gray-300 text-base leading-relaxed">
            Czy na pewno chcesz usunąć roadmapę{" "}
            <span className="text-white font-semibold">&quot;{roadmapTitle}&quot;</span>?
            <br />
            <span className="text-red-300">Ta akcja nie może zostać cofnięta.</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 justify-end pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="cursor-pointer bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-white hover:border-gray-500 transition-all duration-200"
          >
            Anuluj
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="cursor-pointer bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/25 transition-all duration-200"
          >
            Usuń
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
