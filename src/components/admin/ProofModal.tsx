'use client';

import React from 'react';
import { Registration } from '@/lib/supabase';
import { X, Check, Loader2 } from 'lucide-react';

interface ProofModalProps {
  student: Registration | null;
  onClose: () => void;
  onApprove: (student: Registration) => void;
  onReject: () => void;
  actionLoading: boolean;
}

export default function ProofModal({
  student,
  onClose,
  onApprove,
  onReject,
  actionLoading
}: ProofModalProps) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-base text-slate-900 mb-1">
          Payment Verification Details
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Student: <strong className="text-slate-800">{student.full_name}</strong> ({student.roll_number})
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between">
            <span>Chalan Number:</span>
            <strong className="font-mono">{student.chalan_no}</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between">
            <span>Transaction ID:</span>
            <strong className="font-mono text-[#0C7E81] text-sm">
              {student.transaction_id || 'Not Provided'}
            </strong>
          </div>
        </div>

        {student.screenshot_url ? (
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 bg-slate-900 text-center">
            <img
              src={student.screenshot_url}
              alt="Payment Proof"
              className="max-h-72 mx-auto object-contain"
            />
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl mb-4">
            No screenshot uploaded.
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onReject}
            disabled={actionLoading}
            className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer disabled:opacity-50"
          >
            Reject Proof
          </button>
          <button
            type="button"
            onClick={() => onApprove(student)}
            disabled={actionLoading}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0C7E81] hover:bg-[#096366] rounded-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {actionLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Approve & Mark Paid</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
