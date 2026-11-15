'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase, Registration } from '@/lib/supabase';
import { Search, Loader2, CheckCircle2, Clock, XCircle, Upload, FileText, ArrowRight, ShieldAlert, Award, Download, Printer, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import ChalanView from '@/components/ChalanView';
import { generateConvocationPdf } from '@/lib/pdfGenerator';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialRoll = searchParams.get('roll') || '';

  const [query, setQuery] = useState(initialRoll);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<Registration | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Upload proof states
  const [transactionId, setTransactionId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showFullChalan, setShowFullChalan] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  const fetchStudent = async (searchRoll: string) => {
    if (!searchRoll.trim()) return;
    setLoading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      const trimmed = searchRoll.trim().toUpperCase();
      const { data, error } = await supabase
        .from('convocation_registrations')
        .select('*')
        .or(`roll_number.eq.${trimmed},chalan_no.eq.${trimmed}`)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setError('No registration record found for this Roll Number or Chalan Number.');
        setStudent(null);
      } else {
        setStudent(data);
        setTransactionId(data.transaction_id || '');
        if (data.payment_status === 'approved') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading registration details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRoll) {
      fetchStudent(initialRoll);
    }
  }, [initialRoll]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudent(query);
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    if (!transactionId.trim() && !file) {
      alert('Please enter a Transaction ID (TID) or upload a payment screenshot.');
      return;
    }

    setUploading(true);
    try {
      let screenshotUrl = student.screenshot_url || '';

      // 1. Upload screenshot to Supabase Storage if file selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${student.roll_number}_${Date.now()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('payment-proofs')
          .upload(filePath, file, { upsert: true });

        if (uploadErr) {
          console.warn('Storage upload error, using local fallback:', uploadErr);
        } else {
          const { data: publicData } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(filePath);
          screenshotUrl = publicData.publicUrl;
        }
      }

      // 2. Update record in database
      const { error: updateErr } = await supabase
        .from('convocation_registrations')
        .update({
          transaction_id: transactionId.trim(),
          screenshot_url: screenshotUrl || `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400`,
          payment_status: 'pending_approval'
        })
        .eq('id', student.id);

      if (updateErr) throw updateErr;

      setUploadSuccess(true);
      fetchStudent(student.roll_number);
    } catch (err: any) {
      console.error(err);
      alert('Error uploading payment proof: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (showFullChalan && student) {
    return (
      <div>
        <div className="max-w-6xl mx-auto px-4 pt-6 no-print">
          <button 
            onClick={() => setShowFullChalan(false)}
            className="text-xs font-semibold text-[#0C7E81] hover:underline cursor-pointer"
          >
            ← Back to Status View
          </button>
        </div>
        <ChalanView student={student} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Search Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Check Registration & Chalan Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Enter your College Roll Number or Chalan Number to check fee verification status or upload your payment receipt.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex max-w-md mx-auto gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Roll No (e.g. BSCS-22-105)"
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-sm font-mono uppercase"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#0C7E81] text-white font-semibold rounded-xl hover:bg-[#096366] transition flex items-center gap-1.5 text-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6 flex items-center gap-3">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {student && (
        <div className="space-y-6">
          {/* Status Badge Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Student Name
                </span>
                <h2 className="text-xl font-bold text-slate-900">{student.full_name}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Roll No: <strong className="text-slate-800">{student.roll_number}</strong> | Chalan: <strong className="text-[#0C7E81]">{student.chalan_no}</strong>
                </p>
              </div>

              {/* Status Indicator */}
              <div>
                {student.payment_status === 'approved' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold shadow-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Payment Approved & Verified!</span>
                  </div>
                )}
                {student.payment_status === 'pending_approval' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold shadow-xs">
                    <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                    <span>Verification Under Review</span>
                  </div>
                )}
                {student.payment_status === 'pending_payment' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-bold shadow-xs">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Payment Pending</span>
                  </div>
                )}
                {student.payment_status === 'rejected' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-bold shadow-xs">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span>Payment Rejected</span>
                  </div>
                )}
              </div>
            </div>

            {/* Approved Message & Convocation Pass */}
            {student.payment_status === 'approved' && (
              <div className="mt-5 p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <h3 className="font-bold text-emerald-900 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Congratulations! Your Convocation Registration is Approved.
                </h3>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Your fee payment has been verified by the Accounts department. Your official <strong>Convocation Entry Pass</strong> is ready. Please download or print your pass to present at the event.
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setShowPassModal(true)}
                    className="px-4 py-2 bg-[#0C7E81] text-white text-xs font-bold rounded-lg hover:bg-[#096366] transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Convocation Pass</span>
                  </button>

                  <button
                    onClick={() => generateConvocationPdf(student)}
                    className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Pass (PDF)</span>
                  </button>

                  <button
                    onClick={() => setShowFullChalan(true)}
                    className="px-3.5 py-2 bg-white text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Original Chalan</span>
                  </button>
                </div>
              </div>
            )}

            {/* Rejected Message */}
            {student.payment_status === 'rejected' && (
              <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                <p className="font-bold flex items-center gap-1.5 text-sm">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Reason for Rejection:
                </p>
                <p className="mt-1">{student.rejection_reason || 'Uploaded screenshot or TID was invalid. Please re-upload correct payment proof.'}</p>
              </div>
            )}

            {/* View Chalan Link */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500">Department: <strong>{student.department}</strong></span>
              <button
                onClick={() => setShowFullChalan(true)}
                className="text-[#0C7E81] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View Full Chalan & QR Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Upload Payment Proof Form (Show if pending_payment or rejected) */}
          {(student.payment_status === 'pending_payment' || student.payment_status === 'rejected' || student.payment_status === 'pending_approval') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-base mb-1">
                {student.payment_status === 'pending_approval' ? 'Update Payment Proof / TID' : 'Submit Payment Proof'}
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                After transferring PKR 6,000/-, enter your Transaction ID (TID) and upload the receipt screenshot below.
              </p>

              {uploadSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium">
                  ✓ Payment proof submitted successfully! Super Admin will review and verify your payment shortly.
                </div>
              )}

              <form onSubmit={handleUploadProof} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Transaction ID (TID / Trx ID) <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 12938475620 (optional if screenshot attached)"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                    Payment Receipt Screenshot (JPG, PNG)
                  </label>
                  
                  <div className="relative border-2 border-dashed border-slate-300 hover:border-[#0C7E81] rounded-xl p-4 sm:p-6 text-center transition bg-slate-50/50 hover:bg-[#0C7E81]/5 cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{(file.size / 1024).toFixed(1)} KB • Ready to submit</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-3 rounded-full bg-[#0C7E81]/10 text-[#0C7E81] group-hover:scale-110 transition-transform mb-2">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">
                          Click to browse or drag and drop receipt screenshot
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Supported formats: JPG, PNG, WebP (Max: 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {student.screenshot_url && (
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Current submitted proof:</span>
                    <a
                      href={student.screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0C7E81] underline font-medium"
                    >
                      View Uploaded Screenshot
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-2.5 px-4 bg-[#0C7E81] text-white font-bold rounded-xl hover:bg-[#096366] transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Proof...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>{student.payment_status === 'pending_approval' ? 'Update Proof' : 'Submit for Admin Approval'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
      {/* Student Convocation Entry Pass Modal */}
      {showPassModal && student && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPassModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 no-print cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Print & Action Buttons */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 no-print">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Entry Card</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateConvocationPdf(student)}
                  className="px-3.5 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#0C7E81] text-white text-xs font-bold rounded-lg hover:bg-[#096366] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Printable Pass Card */}
            <div className="border-2 border-[#0C7E81] rounded-2xl p-6 bg-gradient-to-b from-[#0C7E81]/5 via-white to-[#0C7E81]/10 relative overflow-hidden">
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
                  <span>Controller of Convocation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#0C7E81]" />
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
