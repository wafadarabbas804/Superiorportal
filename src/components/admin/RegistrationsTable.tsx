'use client';

import React from 'react';
import { Registration } from '@/lib/supabase';
import { Eye, Award, Check, X } from 'lucide-react';

interface RegistrationsTableProps {
  registrations: Registration[];
  selectedIds: string[];
  isAllFilteredSelected: boolean;
  onSelectAllFiltered: () => void;
  onToggleRow: (id: string) => void;
  onViewProof: (student: Registration) => void;
  onGeneratePass: (student: Registration) => void;
  onApproveClick: (student: Registration) => void;
  onRejectClick: (student: Registration) => void;
  onWhatsAppClick: (student: Registration) => void;
}

export default function RegistrationsTable({
  registrations,
  selectedIds,
  isAllFilteredSelected,
  onSelectAllFiltered,
  onToggleRow,
  onViewProof,
  onGeneratePass,
  onApproveClick,
  onRejectClick,
  onWhatsAppClick
}: RegistrationsTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllFilteredSelected}
                  onChange={onSelectAllFiltered}
                  className="w-4 h-4 rounded border-slate-300 text-[#0C7E81] focus:ring-[#0C7E81] cursor-pointer"
                  title="Select / Deselect all in view"
                />
              </th>
              <th className="py-3.5 px-4">Student & Roll No</th>
              <th className="py-3.5 px-4">Department</th>
              <th className="py-3.5 px-4">Contact</th>
              <th className="py-3.5 px-4">Chalan & TID</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Proof</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  Koi registration record nahi mila.
                </td>
              </tr>
            ) : (
              registrations.map((item) => {
                const isRowSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`transition ${isRowSelected ? 'bg-[#0C7E81]/10 font-medium' : 'hover:bg-slate-50/80'}`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isRowSelected}
                        onChange={() => onToggleRow(item.id)}
                        className="w-4 h-4 rounded border-slate-300 text-[#0C7E81] focus:ring-[#0C7E81] cursor-pointer"
                      />
                    </td>

                    {/* Student & Roll No */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.full_name}</div>
                      <div className="text-[11px] font-mono text-[#0C7E81]">{item.roll_number}</div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                      {item.department}
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      <div>{item.student_phone}</div>
                      <div className="text-slate-400 text-[10px]">P: {item.parent_phone}</div>
                    </td>

                    {/* Chalan & TID */}
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-700">{item.chalan_no}</div>
                      {item.transaction_id && (
                        <div className="text-[10px] text-slate-400 font-mono">TID: {item.transaction_id}</div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {item.payment_status === 'approved' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Approved
                        </span>
                      )}
                      {item.payment_status === 'pending_approval' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] animate-pulse">
                          Pending Approval
                        </span>
                      )}
                      {item.payment_status === 'pending_payment' && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                          Pending Payment
                        </span>
                      )}
                      {item.payment_status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium text-[10px]">
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Proof */}
                    <td className="py-3 px-4">
                      {item.screenshot_url ? (
                        <button
                          onClick={() => onViewProof(item)}
                          className="flex items-center gap-1 text-[#0C7E81] font-semibold hover:underline cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No screenshot</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Send WhatsApp Notice */}
                        <button
                          type="button"
                          onClick={() => onWhatsAppClick(item)}
                          className="p-1.5 rounded-lg bg-[#25D366]/15 text-[#128C7E] hover:bg-[#25D366] hover:text-white transition cursor-pointer"
                          title="Send Official WhatsApp Notice"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </button>

                        {/* Generate Pass Button (if approved) */}
                        {item.payment_status === 'approved' && (
                          <button
                            onClick={() => onGeneratePass(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0C7E81] text-white hover:bg-[#096366] transition cursor-pointer flex items-center gap-1 font-semibold text-[11px]"
                            title="Generate Entry Pass"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Generate Pass</span>
                          </button>
                        )}

                        {/* Approve Button (if not approved) */}
                        {item.payment_status !== 'approved' && (
                          <button
                            onClick={() => onApproveClick(item)}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                            title="Approve Payment"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Reject Button (if not rejected) */}
                        {item.payment_status !== 'rejected' && (
                          <button
                            onClick={() => onRejectClick(item)}
                            className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition cursor-pointer"
                            title="Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
