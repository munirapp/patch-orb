"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteMenuConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number, menuName: string) => void;
  itemName: string;
  itemId: number;
  itemType?: string;
}

export function DeleteMenuConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemId,
  itemType = "item",
}: DeleteMenuConfirmationModalProps) {
  const handleConfirm = async () => {
    onConfirm(itemId, itemType);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete {itemType}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">"{itemName}"</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleClose}
            className="border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
