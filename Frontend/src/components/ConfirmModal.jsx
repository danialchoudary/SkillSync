import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-[var(--color-surface)] w-full max-w-md rounded-2xl shadow-xl border border-[var(--color-border)] overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 flex items-start gap-4">
                    <div className={`p-3 rounded-full flex-shrink-0 ${type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                        <FaExclamationTriangle size={20} />
                    </div>
                    <div className="flex-1 mt-1">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] leading-tight mb-2">
                            {title}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors p-1"
                    >
                        <FaTimes size={16} />
                    </button>
                </div>

                <div className="p-4 bg-[var(--color-surface-secondary)] border-t border-[var(--color-border)] flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        className="px-4 py-2 font-medium text-sm text-[var(--color-text-secondary)] bg-white border border-[var(--color-border)] rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-2 font-medium text-sm text-white rounded-lg transition-colors shadow-sm ${type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
