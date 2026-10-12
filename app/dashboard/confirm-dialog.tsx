"use client";

import { useEffect, useRef, useState } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pendingLabel?: string;
  onConfirm: () => Promise<string | null>;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  pendingLabel = "Deleting...",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleClose() {
    if (pending) return;
    setError(null);
    onClose();
  }

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      const failure = await onConfirm();
      if (failure) setError(failure);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      onCancel={(event) => {
        if (pending) event.preventDefault();
        else handleClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) handleClose();
      }}
      className="m-auto w-[calc(100vw-2rem)] max-w-sm rounded-card border border-border bg-surface p-0 text-text shadow-xl backdrop:bg-forest/40 backdrop:backdrop-blur-sm"
    >
      <div className="space-y-4 p-6">
        <div>
          <h2
            id="confirm-dialog-title"
            className="text-base font-semibold tracking-tight"
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {message}
          </p>
        </div>

        {error && (
          <p className="rounded-button bg-expense/10 px-3 py-2 text-sm text-expense">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={pending}
            className="rounded-button border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={pending}
            className="rounded-button bg-expense px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-expense/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
