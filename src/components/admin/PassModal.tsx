'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Registration } from '@/lib/supabase';
import { X, Download, Printer, Loader2 } from 'lucide-react';
import { generateConvocationPdf } from '@/lib/pdfGenerator';

interface PassModalProps {
  student: Registration | null;
  onClose: () => void;
}

export default function PassModal({ student, onClose }: PassModalProps) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  if (!student) return null;

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      await generateConvocationPdf(student);
    } catch (err: any) {
      console.error(err);
      alert('Error generating PDF: ' + (err?.message || 'Unknown error'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 no-print cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Print & Action Buttons */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 no-print">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Official Entry Card
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-3.5 py-1.5 bg-[#0C7E81] text-white text-xs font-bold rounded-lg hover:bg-[#096366] transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
            >
              {downloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{downloadingPdf ? 'Saving...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Printable Pass Card */}
        <div id="printable-pass-card" className="border-2 border-[#0C7E81] rounded-2xl p-6 bg-gradient-to-b from-[#0C7E81]/5 via-white to-[#0C7E81]/10 relative overflow-hidden">
          <div className="flex items-center gap-3.5 border-b border-slate-200 pb-3 mb-4">
            <div className="relative w-14 h-14 flex-shrink-0">
              <Image src="/superior-logo.png" alt="Logo" fill className="object-contain" priority />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-sm uppercase text-[#0C7E81]">
                Superior College Wazirabad
              </h3>
              <p className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">
                Annual Convocation 2026 • Official Entry Pass
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase tracking-wider">
                ✓ Verified & Admitted
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-white/90 p-3 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Name</span>
              <span className="font-bold text-slate-900 text-sm">{student.full_name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Roll Number</span>
              <span className="font-mono font-black text-[#0C7E81] text-sm">{student.roll_number}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Department</span>
              <span className="font-medium text-slate-700 truncate block">{student.department}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Chalan Reference</span>
              <span className="font-mono text-slate-800 font-bold">{student.chalan_no}</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center mb-4">
            <p className="text-xs font-bold text-emerald-800">
              Fee Status: PKR 6,000/- PAID & VERIFIED
            </p>
            <p className="text-[10px] text-emerald-600 mt-0.5">
              Includes Gown Allocation, Degree Folder & Convocation Refreshment Pass
            </p>
          </div>

          <div className="pt-3 border-t border-dashed border-slate-300 flex justify-between items-end text-[10px] text-slate-400">
            <div className="text-center">
              <div className="w-24 border-b border-slate-300 mb-1"></div>
              <span>Student Sign</span>
            </div>
            <div className="text-center">
              <div className="w-24 border-b border-slate-300 mb-1"></div>
              <span>Account Office</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
