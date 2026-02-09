import { useEffect } from "react";

type ConfirmDialogProps = {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDialog({
    open,
    title = "Confirmar ação",
    description = "Tem certeza que deseja realizar esta ação?",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    danger = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onCancel();
        }

        if (open) {
            window.addEventListener("keydown", onKey);
            return () => window.removeEventListener("keydown", onKey);
        }
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-100">
            <button
                type="button"
                aria-label="Fechar"
                className="absolute inset-0 bg-black/60"
                onClick={onCancel}
                />

                <div className="relative mx-auto mt-24 w-[92%] max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
                    <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
                    <p className="mt-2 text-sm text-zinc-300">{description}</p>

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800">
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                                danger
                                    ? "border-red-700 bg-red-900 text-red-100 hover:bg-red-800"
                                    : "border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                            }`}>
                            {confirmText}
                        </button>
                    </div>
                </div>
        </div>
    );
}