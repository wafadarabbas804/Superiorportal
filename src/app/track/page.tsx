'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase, Registration } from '@/lib/supabase';
import { Search, Loader2, CheckCircle2, Clock, XCircle, Upload, FileText, ArrowRight, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';
import ChalanView from '@/components/ChalanView';

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
    if (!transactionId.trim()) {
      alert('Transaction ID (TID) is required.');
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
              <div className="mt-5 p-5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <h3 className="font-bold text-emerald-900 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Congratulations! Your Convocation Registration is Approved.
                </h3>
                <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                  Your fee payment has been verified by the Accounts department. Please print and bring your approved chalan slip along with your student ID card on rehearsal and convocation days.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setShowFullChalan(true)}
                    className="px-4 py-2 bg-[#0C7E81] text-white text-xs font-bold rounded-lg hover:bg-[#096366] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View / Print Approved Slip</span>
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
                {student.payment_status === 'pending_approval' ? 'Update Payment Proof / TID' : 'Submit Payment Proof (Easypaisa)'}
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
                    Transaction ID (TID / Trx ID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 12938475620 ya TID number"
                    defaultValue={student.transaction_id || ''}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0C7E81] text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Upload Payment Screenshot (JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-600 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#0C7E81]/10 file:text-[#0C7E81] hover:file:bg-[#0C7E81]/20 cursor-pointer"
                  />
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
