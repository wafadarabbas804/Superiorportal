'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface RejectModalProps {
  isOpen: boolean;
  reason: string;
  onReasonChange: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  actionLoading: boolean;
}

export default function RejectModal({
  isOpen,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
  actionLoading
}: RejectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
        <h3 className="font-bold text-base text-red-700 mb-1">
          Reject Payment Proof
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Student ko rejection ka message aur reason show hoga.
        </p>

        <textarea
          rows={3}
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="e.g. Invalid Transaction ID, or blurry screenshot. Please send Rs. 6000 and re-upload clear proof."
          className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={actionLoading}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {actionLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Rejecting...</span>
              </>
            ) : (
              <span>Confirm Reject</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
