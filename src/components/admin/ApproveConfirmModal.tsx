'use client';

import React from 'react';
import { Registration } from '@/lib/supabase';
import { CheckCircle2, Check, Loader2 } from 'lucide-react';

interface ApproveConfirmModalProps {
  student: Registration | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  actionLoading: boolean;
}

export default function ApproveConfirmModal({
  student,
  onClose,
  onConfirm,
  actionLoading
}: ApproveConfirmModalProps) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Confirm Payment Approval</h3>
            <p className="text-xs text-slate-500">Superior College Accounts Verification</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Are you sure you want to mark payment as verified for <strong className="text-slate-900">{student.full_name}</strong> (Roll: <span className="font-mono text-[#0C7E81] font-bold">{student.roll_number}</span>)?
        </p>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-5 text-xs space-y-1 font-mono">
          <div className="flex justify-between text-slate-600">
            <span>Chalan No:</span>
            <span className="font-bold text-slate-900">{student.chalan_no}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Amount:</span>
            <span className="font-bold text-emerald-700">PKR 6,000/-</span>
          </div>
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={actionLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(student.id)}
            disabled={actionLoading}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {actionLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Approving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm & Approve</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
