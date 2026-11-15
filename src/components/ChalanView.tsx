'use client';

import React from 'react';
import Image from 'next/image';
import { Printer, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ChalanProps {
  student: {
    chalan_no: string;
    full_name: string;
    roll_number: string;
    student_phone: string;
    student_email: string;
    parent_phone: string;
    department: string;
    amount: number;
    payment_status: string;
    created_at: string;
  };
}

export default function ChalanView({ student }: ChalanProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10">
      {/* Top Action Bar */}
      <div className="no-print mb-6 flex items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <Link
          href="/track"
          className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 hover:text-[#0C7E81] transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Track Status</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/track?roll=${encodeURIComponent(student.roll_number)}`}
            className="px-3 py-2 text-xs sm:text-sm font-semibold text-[#0C7E81] bg-[#0C7E81]/10 rounded-lg hover:bg-[#0C7E81]/20 transition"
          >
            Upload Proof
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#0C7E81] rounded-lg hover:bg-[#096366] transition shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Chalan</span>
          </button>
        </div>
      </div>

      {/* Instructions Box */}
      <div className="no-print mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-xs sm:text-sm">Payment Instructions:</h4>
          <p className="mt-1 text-[11px] sm:text-xs text-amber-800 leading-relaxed">
            Scan the official JazzCash QR code below to transfer <strong>PKR 6,000/-</strong>. 
            After completing the transfer, save your <strong>Transaction ID (TID)</strong> and receipt screenshot, then submit them via the <strong>"Upload Proof"</strong> button.
          </p>
        </div>
      </div>

      {/* SINGLE COMPACT OFFICIAL CHALAN SLIP */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-5 sm:p-8 shadow-md">
        {/* Header */}
        <div className="flex items-center gap-3.5 border-b-2 border-slate-100 pb-4 mb-4">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
            <Image src="/superior-logo.png" alt="Superior Logo" fill className="object-contain" priority />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-base sm:text-lg text-[#0C7E81] uppercase tracking-wide">
              Superior College Wazirabad
            </h2>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Convocation Registration Fee Chalan 2026
            </p>
            <div className="inline-block mt-1 px-2.5 py-0.5 bg-[#0C7E81]/10 text-[#0C7E81] text-[10px] sm:text-xs font-bold rounded-md">
              Official Payment Voucher
            </div>
          </div>
        </div>

        {/* Chalan Details Meta Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-4 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200/80">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Chalan Number</span>
            <span className="font-mono font-bold text-slate-900 text-sm">{student.chalan_no}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Issue Date</span>
            <span className="font-semibold text-slate-700">
              {new Date(student.created_at).toLocaleDateString('en-GB')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number</span>
            <span className="font-mono font-black text-[#0C7E81] text-sm">{student.roll_number}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
            <span className="font-semibold text-slate-700 truncate block">{student.department}</span>
          </div>
        </div>

        {/* Student Contact Information */}
        <div className="space-y-2 text-xs border-b border-slate-100 pb-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Student Name:</span>
            <span className="font-bold text-slate-900 text-sm">{student.full_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Student Phone:</span>
            <span className="text-slate-800 font-mono font-semibold">{student.student_phone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Parent / Guardian Phone:</span>
            <span className="text-slate-800 font-mono font-semibold">{student.parent_phone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Student Email:</span>
            <span className="text-slate-700 font-medium">{student.student_email}</span>
          </div>
        </div>

        {/* Amount Box */}
        <div className="bg-[#0C7E81]/5 border border-[#0C7E81]/20 rounded-xl p-3.5 mb-5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Convocation Registration Fee:</span>
            <span className="font-mono font-bold text-slate-900">PKR {student.amount.toLocaleString()}</span>
          </div>
          <div className="border-t border-[#0C7E81]/20 mt-2 pt-2 flex justify-between items-center">
            <span className="text-xs font-bold text-[#0C7E81]">Total Payable Amount:</span>
            <span className="text-base sm:text-lg font-black text-[#0C7E81]">
              PKR {student.amount.toLocaleString()}/-
            </span>
          </div>
        </div>

        {/* Single Official QR Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
          <div className="max-w-xs mx-auto bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="relative w-full aspect-square max-w-[240px] mx-auto">
              <Image
                src="/payment-qr.jpg"
                alt="JazzCash QR Code - TALHA NASIR"
                fill
                className="object-contain rounded-lg"
                priority
              />
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-3 font-medium">
            Scan via JazzCash / Mobile Banking App to transfer <strong className="text-slate-900 font-bold">PKR 6,000/-</strong>
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-7 pt-4 border-t border-dashed border-slate-300 flex justify-between items-end text-xs text-slate-400">
          <div className="text-center">
            <div className="w-28 border-b border-slate-300 mb-1"></div>
            <span>Student Signature</span>
          </div>
          <div className="text-center">
            <div className="w-28 border-b border-slate-300 mb-1"></div>
            <span>College Authorized Stamp</span>
          </div>
        </div>
      </div>
    </div>
  );
}
