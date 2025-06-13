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
import { ShieldAlert } from "lucide-react";

interface RejectOrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number, menuName: string) => void;
  orderCode: string;
  orderId: number;
}

export function RejectOrderConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  orderCode,
  orderId,
}: RejectOrderConfirmationModalProps) {
  const handleConfirm = async () => {
    onConfirm(orderId, orderCode);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <ShieldAlert className="h-5 w-5" />
            Reject {orderCode}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600">
            Are you sure you want to reject{" "}
            <span className="font-semibold text-slate-900">"{orderCode}"</span>?
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
            <ShieldAlert className="mr-2 h-4 w-4" />
            Reject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
